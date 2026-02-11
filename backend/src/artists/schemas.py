import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ArtistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255, pattern=r"^[a-z0-9\-]+$")
    domain: str = Field(..., min_length=1, max_length=255)
    primary_color: str = Field(default="#000000", max_length=7, pattern=r"^#[0-9a-fA-F]{6}$")
    secondary_color: str = Field(default="#FFFFFF", max_length=7, pattern=r"^#[0-9a-fA-F]{6}$")
    bio: str | None = Field(default=None, max_length=2000)
    logo_url: str | None = Field(default=None, max_length=500)


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(default=None, min_length=1, max_length=255, pattern=r"^[a-z0-9\-]+$")
    domain: str | None = Field(default=None, min_length=1, max_length=255)
    primary_color: str | None = Field(default=None, max_length=7, pattern=r"^#[0-9a-fA-F]{6}$")
    secondary_color: str | None = Field(default=None, max_length=7, pattern=r"^#[0-9a-fA-F]{6}$")
    bio: str | None = Field(default=None, max_length=2000)
    logo_url: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None


class ArtistResponse(ArtistBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArtistPublicResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    domain: str
    primary_color: str
    secondary_color: str
    bio: str | None
    logo_url: str | None

    model_config = {"from_attributes": True}
