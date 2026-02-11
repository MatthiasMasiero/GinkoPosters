import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class VariantBase(BaseModel):
    size: str = Field(..., min_length=1, max_length=10)
    sku: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0, le=99999)
    cost_price: float = Field(..., gt=0, le=99999)


class VariantCreate(VariantBase):
    pass


class VariantResponse(VariantBase):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255, pattern=r"^[a-z0-9\-]+$")
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=500)
    print_file_key: str | None = Field(default=None, max_length=500)


class ProductCreate(ProductBase):
    artist_id: uuid.UUID
    variants: list[VariantCreate] = Field(default=[], max_length=20)


class ProductUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, min_length=1, max_length=255, pattern=r"^[a-z0-9\-]+$")
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=500)
    print_file_key: str | None = Field(default=None, max_length=500)
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
