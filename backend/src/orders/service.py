import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.orders.models import Order, OrderItem
from src.orders.schemas import VALID_ORDER_STATUSES, OrderCreate
from src.products.models import Product, ProductVariant


def _generate_order_number() -> str:
    now = datetime.now(timezone.utc)
    short_id = uuid.uuid4().hex[:6].upper()
    return f"GK-{now.strftime('%Y%m%d')}-{short_id}"


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    # Look up variant prices with product join for artist validation
    variant_ids = [item.variant_id for item in data.items]
    result = await db.execute(
        select(ProductVariant)
        .join(Product, ProductVariant.product_id == Product.id)
        .where(ProductVariant.id.in_(variant_ids))
    )
    variants_by_id = {v.id: v for v in result.scalars().all()}

    subtotal = 0.0
    order_items = []
    for item in data.items:
        variant = variants_by_id.get(item.variant_id)
        if variant is None:
            raise ValueError("One or more selected variants not found")

        # Verify variant belongs to the specified artist via its product
        product_result = await db.execute(
            select(Product).where(
                Product.id == variant.product_id,
                Product.artist_id == data.artist_id,
            )
        )
        if product_result.scalar_one_or_none() is None:
            raise ValueError("Variant does not belong to the specified artist")
        line_total = float(variant.price) * item.quantity
        subtotal += line_total
        order_items.append(
            OrderItem(
                variant_id=item.variant_id,
                quantity=item.quantity,
                unit_price=float(variant.price),
                cost_price=float(variant.cost_price),
            )
        )

    order = Order(
        order_number=_generate_order_number(),
        artist_id=data.artist_id,
        customer_email=data.customer_email,
        customer_name=data.customer_name,
        shipping_address_line1=data.shipping_address_line1,
        shipping_address_line2=data.shipping_address_line2,
        shipping_city=data.shipping_city,
        shipping_state=data.shipping_state,
        shipping_postal_code=data.shipping_postal_code,
        shipping_country=data.shipping_country,
        subtotal=subtotal,
        status="pending_payment",
    )
    db.add(order)
    await db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    await db.flush()
    # Reload with eager-loaded items to avoid MissingGreenlet in async context
    return await get_order_by_id(db, order.id)  # type: ignore[return-value]


async def get_order_by_id(db: AsyncSession, order_id: uuid.UUID) -> Order | None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def get_order_status(db: AsyncSession, order_id: uuid.UUID) -> Order | None:
    result = await db.execute(select(Order).where(Order.id == order_id))
    return result.scalar_one_or_none()


async def list_orders(
    db: AsyncSession,
    artist_id: uuid.UUID | None = None,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Order]:
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if artist_id is not None:
        query = query.where(Order.artist_id == artist_id)
    if status is not None:
        query = query.where(Order.status == status)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return list(result.scalars().all())


_VALID_STATUSES = set(VALID_ORDER_STATUSES.__args__)


async def update_order_status(
    db: AsyncSession, order_id: uuid.UUID, new_status: str, notes: str | None = None
) -> Order | None:
    if new_status not in _VALID_STATUSES:
        raise ValueError(f"Invalid order status: {new_status}")
    order = await get_order_by_id(db, order_id)
    if order is None:
        return None
    order.status = new_status
    if notes is not None:
        order.notes = notes
    await db.flush()
    # Reload with eager-loaded items to avoid MissingGreenlet in async context
    return await get_order_by_id(db, order_id)  # type: ignore[return-value]


async def get_order_by_stripe_session(
    db: AsyncSession, session_id: str
) -> Order | None:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.stripe_session_id == session_id)
    )
    return result.scalar_one_or_none()
