import uuid
from datetime import datetime

from pydantic import BaseModel


class ArtistBase(BaseModel):
    name: str
    slug: str
    domain: str
    primary_color: str = "#000000"
    secondary_color: str = "#FFFFFF"
    bio: str | None = None
    logo_url: str | None = None


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    domain: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    bio: str | None = None
    logo_url: str | None = None
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
