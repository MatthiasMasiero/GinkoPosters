import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.artists.schemas import (
    ArtistCreate,
    ArtistPublicResponse,
    ArtistResponse,
    ArtistUpdate,
)
from src.artists.service import (
    create_artist,
    get_artist_by_domain,
    get_artist_by_slug,
    list_active_artists,
    list_all_artists,
    update_artist,
)
from src.auth.dependencies import require_admin
from src.dependencies import get_db

router = APIRouter(tags=["artists"])


# Public endpoints
@router.get("/api/v1/artists/", response_model=list[ArtistPublicResponse])
async def get_active_artists(db: AsyncSession = Depends(get_db)):
    return await list_active_artists(db)


@router.get("/api/v1/artists/by-domain/{domain}", response_model=ArtistPublicResponse)
async def get_artist_by_domain_name(domain: str, db: AsyncSession = Depends(get_db)):
    artist = await get_artist_by_domain(db, domain)
    if artist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    return artist


@router.get("/api/v1/artists/by-slug/{slug}", response_model=ArtistPublicResponse)
async def get_artist_by_slug_name(slug: str, db: AsyncSession = Depends(get_db)):
    artist = await get_artist_by_slug(db, slug)
    if artist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    return artist


# Admin endpoints
@router.get("/api/v1/admin/artists", response_model=list[ArtistResponse])
async def admin_list_artists(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await list_all_artists(db)


@router.post(
    "/api/v1/admin/artists",
    response_model=ArtistResponse,
    status_code=status.HTTP_201_CREATED,
)
async def admin_create_artist(
    body: ArtistCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await create_artist(db, body)


@router.put("/api/v1/admin/artists/{artist_id}", response_model=ArtistResponse)
async def admin_update_artist(
    artist_id: uuid.UUID,
    body: ArtistUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    artist = await update_artist(db, artist_id, body)
    if artist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    return artist
