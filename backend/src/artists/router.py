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
    delete_artist,
    get_artist_by_domain,
    get_artist_by_id,
    get_artist_by_slug,
    list_active_artists,
    list_all_artists,
    update_artist,
)
from src.auth.dependencies import require_admin
from src.dependencies import get_db
from src.pagination import pagination_params

router = APIRouter(tags=["artists"])


# Public endpoints
@router.get("/api/v1/artists", response_model=list[ArtistPublicResponse])
async def get_active_artists(
    pagination: tuple[int, int] = Depends(pagination_params),
    db: AsyncSession = Depends(get_db),
):
    limit, offset = pagination
    return await list_active_artists(db, limit=limit, offset=offset)


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
    pagination: tuple[int, int] = Depends(pagination_params),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    limit, offset = pagination
    return await list_all_artists(db, limit=limit, offset=offset)


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


@router.get("/api/v1/admin/artists/{artist_id}", response_model=ArtistResponse)
async def admin_get_artist(
    artist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    artist = await get_artist_by_id(db, artist_id)
    if artist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
    return artist


@router.delete(
    "/api/v1/admin/artists/{artist_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def admin_delete_artist(
    artist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    deleted = await delete_artist(db, artist_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")
