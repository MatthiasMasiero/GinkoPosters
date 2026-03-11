import re

import boto3
from botocore.config import Config

from src.config import settings

ADMIN_PREVIEW_EXPIRY = 3600  # 1 hour
FULFILLMENT_EXPIRY = 604800  # 7 days

ALLOWED_UPLOAD_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
]
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB


_VALID_KEY_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_/\-\.]*$")


def _validate_s3_key(key: str) -> None:
    """Validate S3 key to prevent path traversal attacks."""
    if ".." in key:
        raise ValueError("S3 key must not contain '..'")
    if key.startswith("/"):
        raise ValueError("S3 key must not start with '/'")
    if not _VALID_KEY_PATTERN.match(key):
        raise ValueError(
            "S3 key contains invalid characters. "
            "Only alphanumeric characters, underscores, hyphens, dots, and forward slashes are allowed."
        )


def _get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_DEFAULT_REGION,
        config=Config(signature_version="s3v4"),
    )


def generate_upload_url(key: str, content_type: str = "application/pdf") -> str:
    _validate_s3_key(key)
    if content_type not in ALLOWED_UPLOAD_CONTENT_TYPES:
        raise ValueError(f"Content type not allowed: {content_type}")
    client = _get_s3_client()
    return client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=ADMIN_PREVIEW_EXPIRY,
    )


def generate_download_url(key: str, for_fulfillment: bool = False) -> str:
    _validate_s3_key(key)
    client = _get_s3_client()
    expiry = FULFILLMENT_EXPIRY if for_fulfillment else ADMIN_PREVIEW_EXPIRY
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
        ExpiresIn=expiry,
    )
