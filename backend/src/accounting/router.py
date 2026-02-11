from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounting.schemas import AccountingSummary, ArtistPayoutSummary
from src.accounting.service import (
    generate_daily_digest_csv,
    get_artist_payouts,
    get_summary,
)
from src.auth.dependencies import require_admin
from src.dependencies import get_db

router = APIRouter(prefix="/api/v1/admin/accounting", tags=["accounting"])


@router.get("/summary", response_model=AccountingSummary)
async def accounting_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    artist_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    import uuid

    aid = uuid.UUID(artist_id) if artist_id else None
    return await get_summary(db, start_date, end_date, aid)


@router.get("/daily-digest")
async def daily_digest(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    csv_content = await generate_daily_digest_csv(db, start_date, end_date)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=daily-digest.csv"},
    )


@router.get("/artist-payouts", response_model=list[ArtistPayoutSummary])
async def artist_payouts(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    return await get_artist_payouts(db)
