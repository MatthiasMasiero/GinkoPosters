from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import require_admin
from src.dependencies import get_db
from src.fulfillment.schemas import ExportCSVRequest, MarkSentRequest, MarkSentResponse
from src.fulfillment.service import export_orders_csv, mark_orders_sent

router = APIRouter(prefix="/api/v1/admin/fulfillment", tags=["fulfillment"])


@router.post("/export-csv")
async def export_csv(
    body: ExportCSVRequest,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    csv_content = await export_orders_csv(db, body.order_ids)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=print-shrimp-export.csv"},
    )


@router.post("/mark-sent", response_model=MarkSentResponse)
async def mark_sent(
    body: MarkSentRequest,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    count = await mark_orders_sent(db, body.order_ids)
    return MarkSentResponse(updated_count=count)
