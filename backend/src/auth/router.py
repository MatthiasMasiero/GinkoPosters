from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.models import User
from src.auth.schemas import LoginRequest, TokenResponse, UserResponse
from src.auth.service import (
    authenticate_user,
    blacklist_token,
    create_access_token,
    decode_access_token,
)
from src.dependencies import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    token = create_access_token(current_user.id)
    return TokenResponse(access_token=token)


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone

    from fastapi.security import HTTPBearer

    auth_header = request.headers.get("authorization", "")
    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)
    if payload and payload.get("jti"):
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        await blacklist_token(db, payload["jti"], exp)
    return {"detail": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
