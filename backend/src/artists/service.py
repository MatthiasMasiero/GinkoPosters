import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.artists.models import Artist
from src.artists.schemas import ArtistCreate, ArtistUpdate


async def list_active_artists(db: AsyncSession) -> list[Artist]:
    result = await db.execute(
        select(Artist).where(Artist.is_active.is_(True)).order_by(Artist.name)
    )
    return list(result.scalars().all())


async def get_artist_by_domain(db: AsyncSession, domain: str) -> Artist | None:
    result = await db.execute(select(Artist).where(Artist.domain == domain))
    return result.scalar_one_or_none()


async def list_all_artists(db: AsyncSession) -> list[Artist]:
    result = await db.execute(select(Artist).order_by(Artist.name))
    return list(result.scalars().all())


async def get_artist_by_id(db: AsyncSession, artist_id: uuid.UUID) -> Artist | None:
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    return result.scalar_one_or_none()


async def create_artist(db: AsyncSession, data: ArtistCreate) -> Artist:
    artist = Artist(**data.model_dump())
    db.add(artist)
    await db.flush()
    await db.refresh(artist)
    return artist


async def update_artist(
    db: AsyncSession, artist_id: uuid.UUID, data: ArtistUpdate
) -> Artist | None:
    artist = await get_artist_by_id(db, artist_id)
    if artist is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(artist, field, value)
    await db.flush()
    await db.refresh(artist)
    return artist


async def get_all_artist_domains(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(Artist.domain).where(Artist.is_active.is_(True))
    )
    return list(result.scalars().all())
