from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.auth.dependencies import require_admin
from src.config import settings
from src.storage.service import ALLOWED_UPLOAD_CONTENT_TYPES, generate_upload_url

router = APIRouter(tags=["uploads"])


class PresignedUrlRequest(BaseModel):
    key: str = Field(..., min_length=1, max_length=500)
    content_type: str = Field(..., min_length=1, max_length=100)


class PresignedUrlResponse(BaseModel):
    upload_url: str
    public_url: str


@router.post(
    "/api/v1/admin/uploads/presigned-url",
    response_model=PresignedUrlResponse,
    status_code=status.HTTP_200_OK,
)
async def get_presigned_upload_url(
    body: PresignedUrlRequest,
    _admin=Depends(require_admin),
):
    if body.content_type not in ALLOWED_UPLOAD_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Content type not allowed. Allowed: {', '.join(ALLOWED_UPLOAD_CONTENT_TYPES)}",
        )

    try:
        upload_url = generate_upload_url(body.key, body.content_type)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    public_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_DEFAULT_REGION}.amazonaws.com/{body.key}"

    return PresignedUrlResponse(upload_url=upload_url, public_url=public_url)
