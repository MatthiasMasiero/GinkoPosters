import uuid
from datetime import date

from pydantic import BaseModel


class AccountingSummaryRequest(BaseModel):
    start_date: date
    end_date: date
    artist_id: uuid.UUID | None = None


class AccountingSummary(BaseModel):
    total_revenue: float
    total_cogs: float
    total_stripe_fees: float
    total_net_profit: float
    transaction_count: int


class DailyDigestRequest(BaseModel):
    start_date: date
    end_date: date


class ArtistPayoutSummary(BaseModel):
    artist_id: uuid.UUID
    artist_name: str
    total_revenue: float
    total_cogs: float
    total_stripe_fees: float
    total_net_profit: float
    order_count: int
