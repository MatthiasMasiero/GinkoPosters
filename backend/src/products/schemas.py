import uuid
from datetime import datetime

from pydantic import BaseModel


class VariantBase(BaseModel):
    size: str
    sku: str
    price: float
    cost_price: float


class VariantCreate(VariantBase):
    pass


class VariantResponse(VariantBase):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    title: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    print_file_key: str | None = None


class ProductCreate(ProductBase):
    artist_id: uuid.UUID
    variants: list[VariantCreate] = []


class ProductUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    print_file_key: str | None = None
    is_active: bool | None = None


class ProductResponse(ProductBase):
    id: uuid.UUID
    artist_id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variants: list[VariantResponse] = []

    model_config = {"from_attributes": True}


class ProductPublicResponse(BaseModel):
    id: uuid.UUID
    artist_id: uuid.UUID
    title: str
    slug: str
    description: str | None
    image_url: str | None
    variants: list[VariantResponse] = []

    model_config = {"from_attributes": True}
