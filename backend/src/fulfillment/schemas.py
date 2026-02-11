import uuid

from pydantic import BaseModel


class ExportCSVRequest(BaseModel):
    order_ids: list[uuid.UUID]


class MarkSentRequest(BaseModel):
    order_ids: list[uuid.UUID]


class MarkSentResponse(BaseModel):
    updated_count: int
