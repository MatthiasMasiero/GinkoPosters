import uuid

from pydantic import BaseModel


class CheckoutSessionRequest(BaseModel):
    order_id: uuid.UUID


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str
