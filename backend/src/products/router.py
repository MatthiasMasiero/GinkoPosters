import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import require_admin
from src.dependencies import get_db
from src.products.schemas import (
    ProductCreate,
    ProductPublicResponse,
    ProductResponse,
    ProductUpdate,
)
from src.products.service import (
    create_product,
    get_product_by_id,
    list_all_products,
    list_products_by_artist,
    update_product,
)

router = APIRouter(tags=["products"])


# Public endpoints
@router.get(
    "/api/v1/artists/{artist_id}/products",
    response_model=list[ProductPublicResponse],
)
async def get_artist_products(
    artist_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    return await list_products_by_artist(db, artist_id)


@router.get("/api/v1/products/{product_id}", response_model=ProductPublicResponse)
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    product = await get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


# Admin endpoints
@router.get("/api/v1/admin/products", response_model=list[ProductResponse])
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await list_all_products(db)


@router.post(
    "/api/v1/admin/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_product(
    body: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await create_product(db, body)


@router.put("/api/v1/admin/products/{product_id}", response_model=ProductResponse)
async def admin_update_product(
    product_id: uuid.UUID,
    body: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    product = await update_product(db, product_id, body)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
