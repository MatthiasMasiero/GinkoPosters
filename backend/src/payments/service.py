import uuid

import stripe
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounting.models import Transaction
from src.config import settings
from src.emails.service import send_order_confirmation
from src.orders.service import get_order_by_id, get_order_by_stripe_session

stripe.api_key = settings.STRIPE_SECRET_KEY

STRIPE_FEE_PERCENT = 0.029
STRIPE_FEE_FIXED = 0.30


async def create_checkout_session(
    db: AsyncSession, order_id: uuid.UUID
) -> stripe.checkout.Session:
    order = await get_order_by_id(db, order_id)
    if order is None:
        raise ValueError("Order not found")

    # Calculate discount factor for distributing across line items
    discount_rate = float(order.discount) / float(order.subtotal) if float(order.subtotal) > 0 else 0

    line_items = []
    for item in order.items:
        # Build product name from variant's product title + size
        product_title = "Poster"
        size_label = ""
        if hasattr(item, "variant") and item.variant:
            size_label = item.variant.size or ""
            if hasattr(item.variant, "product") and item.variant.product:
                product_title = item.variant.product.title
        name = f"{product_title} — {size_label}" if size_label else product_title

        # Apply discount proportionally to each line item
        unit_price = float(item.unit_price) * (1 - discount_rate)
        line_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "unit_amount": int(round(unit_price * 100)),
                    "product_data": {"name": name},
                },
                "quantity": item.quantity,
            }
        )

    # Add flat-rate shipping
    line_items.append(
        {
            "price_data": {
                "currency": "eur",
                "unit_amount": int(settings.SHIPPING_COST_EUR * 100),
                "product_data": {"name": "Shipping"},
            },
            "quantity": 1,
        }
    )

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        success_url=f"{settings.FRONTEND_URL}/storefront/order-confirmation?order_id={order.id}",
        cancel_url=f"{settings.FRONTEND_URL}/storefront/checkout?order_id={order.id}&cancelled=true",
        customer_email=order.customer_email,
        metadata={"order_id": str(order.id)},
    )

    order.stripe_session_id = session.id
    await db.flush()

    return session


async def handle_checkout_completed(db: AsyncSession, session_id: str) -> None:
    order = await get_order_by_stripe_session(db, session_id)
    if order is None:
        return

    # Idempotency: skip if already processed
    if order.status != "pending_payment":
        return

    order.status = "paid"

    # Retrieve the payment intent for the actual Stripe fee
    session = stripe.checkout.Session.retrieve(session_id)
    order.stripe_payment_intent_id = session.payment_intent

    # Calculate financials (revenue = subtotal after discount)
    total_revenue = float(order.subtotal) - float(order.discount)
    total_cogs = sum(float(item.cost_price) * item.quantity for item in order.items)
    stripe_fee = round(total_revenue * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED, 2)
    net_profit = round(total_revenue - total_cogs - stripe_fee, 2)

    transaction = Transaction(
        order_id=order.id,
        artist_id=order.artist_id,
        type="sale",
        revenue=total_revenue,
        cogs=total_cogs,
        stripe_fee=stripe_fee,
        net_profit=net_profit,
    )
    db.add(transaction)
    await db.flush()

    await send_order_confirmation(order)


async def handle_charge_refunded(db: AsyncSession, payment_intent_id: str) -> None:
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from src.orders.models import Order

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.stripe_payment_intent_id == payment_intent_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        return

    order.status = "refunded"

    total_revenue = float(order.subtotal) - float(order.discount)
    total_cogs = sum(float(item.cost_price) * item.quantity for item in order.items)
    stripe_fee = round(total_revenue * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED, 2)

    transaction = Transaction(
        order_id=order.id,
        artist_id=order.artist_id,
        type="refund",
        revenue=-total_revenue,
        cogs=-total_cogs,
        stripe_fee=-stripe_fee,
        net_profit=round(-total_revenue + total_cogs + stripe_fee, 2),
    )
    db.add(transaction)
    await db.flush()
