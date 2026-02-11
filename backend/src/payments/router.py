import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.dependencies import get_db
from src.payments.schemas import CheckoutSessionRequest, CheckoutSessionResponse
from src.payments.service import (
    create_checkout_session,
    handle_charge_refunded,
    handle_checkout_completed,
)

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
@limiter.limit("10/minute")
async def create_checkout(
    request: Request, body: CheckoutSessionRequest, db: AsyncSession = Depends(get_db)
):
    try:
        session = await create_checkout_session(db, body.order_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return CheckoutSessionResponse(checkout_url=session.url, session_id=session.id)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature"
        )

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_completed(db, session["id"])
    elif event["type"] == "charge.refunded":
        charge = event["data"]["object"]
        await handle_charge_refunded(db, charge["payment_intent"])

    return {"status": "ok"}
