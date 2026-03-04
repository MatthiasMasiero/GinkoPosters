import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import TokenBlacklist, User
from src.config import settings

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": now,
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


async def is_token_blacklisted(db: AsyncSession, jti: str) -> bool:
    result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.jti == jti)
    )
    return result.scalar_one_or_none() is not None


async def blacklist_token(db: AsyncSession, jti: str, expires_at: datetime) -> None:
    entry = TokenBlacklist(jti=jti, expires_at=expires_at)
    db.add(entry)
    await db.flush()


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        return None

    # Check account lockout
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        return None

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=LOCKOUT_DURATION_MINUTES
            )
        await db.flush()
        return None

    # Reset on successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.flush()
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
