import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreate(BaseModel):
    variant_id: uuid.UUID
    quantity: int = Field(default=1, ge=1, le=100)


class OrderCreate(BaseModel):
    artist_id: uuid.UUID
    customer_email: EmailStr
    customer_name: str = Field(..., min_length=1, max_length=255)
    shipping_address_line1: str = Field(..., min_length=1, max_length=255)
    shipping_address_line2: str | None = Field(default=None, max_length=255)
    shipping_city: str = Field(..., min_length=1, max_length=100)
    shipping_state: str | None = Field(default=None, max_length=100)
    shipping_postal_code: str = Field(..., min_length=1, max_length=20)
    shipping_country: str = Field(..., min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    items: list[OrderItemCreate] = Field(..., min_length=1, max_length=50)


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    variant_id: uuid.UUID
    quantity: int
    unit_price: float
    cost_price: float

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    artist_id: uuid.UUID
    status: str
    customer_email: str
    customer_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None
    shipping_city: str
    shipping_state: str | None
    shipping_postal_code: str
    shipping_country: str
    subtotal: float
    stripe_session_id: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


VALID_ORDER_STATUSES = Literal[
    "pending_payment", "paid", "sent_to_printer", "shipped", "delivered", "cancelled", "refunded"
]


class OrderStatusUpdate(BaseModel):
    status: VALID_ORDER_STATUSES
    notes: str | None = Field(default=None, max_length=1000)
