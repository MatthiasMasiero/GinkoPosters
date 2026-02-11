import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import require_admin
from src.dependencies import get_db
from src.orders.schemas import (
    OrderCreate,
    OrderResponse,
    OrderStatusResponse,
    OrderStatusUpdate,
)
from src.orders.service import (
    create_order,
    get_order_status,
    list_orders,
    update_order_status,
)

router = APIRouter(tags=["orders"])


# Public endpoints
@router.post(
    "/api/v1/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_new_order(body: OrderCreate, db: AsyncSession = Depends(get_db)):
    try:
        order = await create_order(db, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return order


@router.get("/api/v1/orders/{order_id}/status", response_model=OrderStatusResponse)
async def get_order_status_endpoint(
    order_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    order = await get_order_status(db, order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


# Admin endpoints
@router.get("/api/v1/admin/orders", response_model=list[OrderResponse])
async def admin_list_orders(
    artist_id: uuid.UUID | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await list_orders(db, artist_id=artist_id, status=status)


@router.patch("/api/v1/admin/orders/{order_id}/status", response_model=OrderResponse)
async def admin_update_order_status(
    order_id: uuid.UUID,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    order = await update_order_status(db, order_id, body.status, body.notes)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
