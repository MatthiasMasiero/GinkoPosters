import csv
import io
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.orders.models import Order
from src.products.models import ProductVariant


async def export_orders_csv(db: AsyncSession, order_ids: list[uuid.UUID]) -> str:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id.in_(order_ids))
        .order_by(Order.created_at)
    )
    orders = result.scalars().all()

    # Gather all variant IDs to fetch SKUs
    all_variant_ids = []
    for order in orders:
        for item in order.items:
            all_variant_ids.append(item.variant_id)

    variant_result = await db.execute(
        select(ProductVariant).where(ProductVariant.id.in_(all_variant_ids))
    )
    variants_by_id = {v.id: v for v in variant_result.scalars().all()}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Number",
        "SKU",
        "Quantity",
        "Customer Name",
        "Address Line 1",
        "Address Line 2",
        "City",
        "State",
        "Postal Code",
        "Country",
        "Email",
    ])

    for order in orders:
        for item in order.items:
            variant = variants_by_id.get(item.variant_id)
            sku = variant.sku if variant else "UNKNOWN"
            writer.writerow([
                order.order_number,
                sku,
                item.quantity,
                order.customer_name,
                order.shipping_address_line1,
                order.shipping_address_line2 or "",
                order.shipping_city,
                order.shipping_state or "",
                order.shipping_postal_code,
                order.shipping_country,
                order.customer_email,
            ])

    return output.getvalue()


async def mark_orders_sent(db: AsyncSession, order_ids: list[uuid.UUID]) -> int:
    result = await db.execute(
        select(Order).where(
            Order.id.in_(order_ids),
            Order.status == "paid",
        )
    )
    orders = result.scalars().all()
    count = 0
    for order in orders:
        order.status = "sent_to_printer"
        count += 1
    await db.flush()
    return count
