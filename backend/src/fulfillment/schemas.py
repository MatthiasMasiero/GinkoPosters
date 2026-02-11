import uuid

from pydantic import BaseModel, Field


class ExportCSVRequest(BaseModel):
    order_ids: list[uuid.UUID] = Field(..., min_length=1, max_length=500)


class MarkSentRequest(BaseModel):
    order_ids: list[uuid.UUID] = Field(..., min_length=1, max_length=500)


class MarkSentResponse(BaseModel):
    updated_count: int
