import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.products.models import Product, ProductVariant
from src.products.schemas import ProductCreate, ProductUpdate


async def list_products_by_artist(
    db: AsyncSession, artist_id: uuid.UUID
) -> list[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.variants))
        .where(Product.artist_id == artist_id, Product.is_active.is_(True))
        .order_by(Product.title)
    )
    return list(result.scalars().all())


async def get_product_by_id(db: AsyncSession, product_id: uuid.UUID) -> Product | None:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.variants))
        .where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def list_all_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.variants))
        .order_by(Product.title)
    )
    return list(result.scalars().all())


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(
        artist_id=data.artist_id,
        title=data.title,
        slug=data.slug,
        description=data.description,
        image_url=data.image_url,
        print_file_key=data.print_file_key,
    )
    db.add(product)
    await db.flush()

    for variant_data in data.variants:
        variant = ProductVariant(
            product_id=product.id,
            size=variant_data.size,
            sku=variant_data.sku,
            price=variant_data.price,
            cost_price=variant_data.cost_price,
        )
        db.add(variant)

    await db.flush()
    await db.refresh(product)
    # Reload with variants
    return await get_product_by_id(db, product.id)  # type: ignore[return-value]


async def update_product(
    db: AsyncSession, product_id: uuid.UUID, data: ProductUpdate
) -> Product | None:
    product = await get_product_by_id(db, product_id)
    if product is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.flush()
    await db.refresh(product)
    return await get_product_by_id(db, product.id)
