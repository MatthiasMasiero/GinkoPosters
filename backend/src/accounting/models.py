import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.base_model import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True
    )
    artist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artists.id"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    cogs: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stripe_fee: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    net_profit: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), index=True)

    order: Mapped["Order"] = relationship(back_populates="transactions")  # noqa: F821
    artist: Mapped["Artist"] = relationship()  # noqa: F821
