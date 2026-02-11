import csv
import io
import uuid
from datetime import date, datetime, time, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounting.models import Transaction
from src.artists.models import Artist


def _date_to_datetime(d: date, end: bool = False) -> datetime:
    if end:
        return datetime.combine(d, time.max, tzinfo=timezone.utc)
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


async def get_summary(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    artist_id: uuid.UUID | None = None,
) -> dict:
    query = select(
        func.coalesce(func.sum(Transaction.revenue), 0).label("total_revenue"),
        func.coalesce(func.sum(Transaction.cogs), 0).label("total_cogs"),
        func.coalesce(func.sum(Transaction.stripe_fee), 0).label("total_stripe_fees"),
        func.coalesce(func.sum(Transaction.net_profit), 0).label("total_net_profit"),
        func.count(Transaction.id).label("transaction_count"),
    ).where(
        Transaction.created_at >= _date_to_datetime(start_date),
        Transaction.created_at <= _date_to_datetime(end_date, end=True),
    )
    if artist_id is not None:
        query = query.where(Transaction.artist_id == artist_id)

    result = await db.execute(query)
    row = result.one()
    return {
        "total_revenue": float(row.total_revenue),
        "total_cogs": float(row.total_cogs),
        "total_stripe_fees": float(row.total_stripe_fees),
        "total_net_profit": float(row.total_net_profit),
        "transaction_count": row.transaction_count,
    }


async def generate_daily_digest_csv(
    db: AsyncSession, start_date: date, end_date: date
) -> str:
    result = await db.execute(
        select(Transaction, Artist.name)
        .join(Artist, Transaction.artist_id == Artist.id)
        .where(
            Transaction.created_at >= _date_to_datetime(start_date),
            Transaction.created_at <= _date_to_datetime(end_date, end=True),
        )
        .order_by(Transaction.created_at)
    )
    rows = result.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date",
        "Transaction ID",
        "Order ID",
        "Artist",
        "Type",
        "Revenue",
        "COGS",
        "Stripe Fee",
        "Net Profit",
    ])

    for txn, artist_name in rows:
        writer.writerow([
            txn.created_at.strftime("%Y-%m-%d"),
            str(txn.id),
            str(txn.order_id),
            artist_name,
            txn.type,
            f"{float(txn.revenue):.2f}",
            f"{float(txn.cogs):.2f}",
            f"{float(txn.stripe_fee):.2f}",
            f"{float(txn.net_profit):.2f}",
        ])

    return output.getvalue()


async def get_artist_payouts(db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(
            Transaction.artist_id,
            Artist.name.label("artist_name"),
            func.sum(Transaction.revenue).label("total_revenue"),
            func.sum(Transaction.cogs).label("total_cogs"),
            func.sum(Transaction.stripe_fee).label("total_stripe_fees"),
            func.sum(Transaction.net_profit).label("total_net_profit"),
            func.count(Transaction.id).label("order_count"),
        )
        .join(Artist, Transaction.artist_id == Artist.id)
        .where(Transaction.type == "sale")
        .group_by(Transaction.artist_id, Artist.name)
        .order_by(Artist.name)
    )
    rows = result.all()
    return [
        {
            "artist_id": row.artist_id,
            "artist_name": row.artist_name,
            "total_revenue": float(row.total_revenue),
            "total_cogs": float(row.total_cogs),
            "total_stripe_fees": float(row.total_stripe_fees),
            "total_net_profit": float(row.total_net_profit),
            "order_count": row.order_count,
        }
        for row in rows
    ]
