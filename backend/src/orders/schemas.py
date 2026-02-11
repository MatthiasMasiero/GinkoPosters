import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class OrderItemCreate(BaseModel):
    variant_id: uuid.UUID
    quantity: int = 1


class OrderCreate(BaseModel):
    artist_id: uuid.UUID
    customer_email: EmailStr
    customer_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None = None
    shipping_city: str
    shipping_state: str | None = None
    shipping_postal_code: str
    shipping_country: str
    items: list[OrderItemCreate]


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


class OrderStatusUpdate(BaseModel):
    status: str
    notes: str | None = None
