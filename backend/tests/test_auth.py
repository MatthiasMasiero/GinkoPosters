"""Comprehensive tests for the GinkoPosters authentication system.

Covers password hashing, JWT creation/decoding, login/refresh/me endpoints,
authorization guards, and expired token handling.
"""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from freezegun import freeze_time
from httpx import AsyncClient
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.service import (
    authenticate_user,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from src.config import settings


# ---------------------------------------------------------------------------
# 1. Password hashing
# ---------------------------------------------------------------------------


class TestPasswordHashing:
    """Tests for verify_password and hash_password."""

    def test_verify_password_correct(self):
        """verify_password returns True when the plain password matches the hash."""
        hashed = hash_password("my-secret-password")
        assert verify_password("my-secret-password", hashed) is True

    def test_verify_password_wrong(self):
        """verify_password returns False when the plain password does not match."""
        hashed = hash_password("my-secret-password")
        assert verify_password("wrong-password", hashed) is False

    def test_hash_password_produces_unique_hashes(self):
        """Hashing the same password twice produces different hashes (due to salt)."""
        hash1 = hash_password("same-password")
        hash2 = hash_password("same-password")
        assert hash1 != hash2
        # Both should still verify correctly
        assert verify_password("same-password", hash1) is True
        assert verify_password("same-password", hash2) is True

    def test_verify_password_empty_string(self):
        """verify_password returns False when comparing against an empty password."""
        hashed = hash_password("real-password")
        assert verify_password("", hashed) is False


# ---------------------------------------------------------------------------
# 2 & 3. JWT creation and decoding
# ---------------------------------------------------------------------------


class TestJWTTokens:
    """Tests for create_access_token and decode_access_token."""

    def test_create_access_token_returns_decodable_token(self):
        """create_access_token returns a token that can be decoded with the correct sub claim."""
        user_id = uuid.uuid4()
        token = create_access_token(user_id)

        # Decode directly with python-jose to inspect the payload
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        assert payload["sub"] == str(user_id)
        assert "exp" in payload
        assert "iat" in payload

    def test_create_access_token_expiry_is_in_future(self):
        """The token's expiry claim is set to JWT_EXPIRY_HOURS in the future."""
        user_id = uuid.uuid4()
        token = create_access_token(user_id)

        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        expected = now + timedelta(hours=settings.JWT_EXPIRY_HOURS)
        # JWT exp is integer seconds; allow 5 seconds tolerance
        assert abs((exp - expected).total_seconds()) < 5

    def test_decode_access_token_valid(self):
        """decode_access_token returns the payload dict for a valid token."""
        user_id = uuid.uuid4()
        token = create_access_token(user_id)
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == str(user_id)

    def test_decode_access_token_invalid_token(self):
        """decode_access_token returns None for a garbage token."""
        assert decode_access_token("not-a-valid-jwt-token") is None

    def test_decode_access_token_wrong_secret(self):
        """decode_access_token returns None when the token was signed with a different key."""
        user_id = uuid.uuid4()
        token = jwt.encode(
            {
                "sub": str(user_id),
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            },
            "wrong-secret-key",
            algorithm="HS256",
        )
        assert decode_access_token(token) is None

    def test_decode_access_token_expired(self):
        """decode_access_token returns None for an expired token."""
        user_id = uuid.uuid4()
        token = jwt.encode(
            {
                "sub": str(user_id),
                "exp": datetime.now(timezone.utc) - timedelta(hours=1),
                "iat": datetime.now(timezone.utc) - timedelta(hours=5),
            },
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
        assert decode_access_token(token) is None


# ---------------------------------------------------------------------------
# 4. Login success
# ---------------------------------------------------------------------------


class TestLoginEndpoint:
    """Tests for POST /api/v1/auth/login."""

    async def test_login_success(
        self, client: AsyncClient, admin_user: User
    ):
        """Valid credentials return a 200 with an access_token."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@ginkoposters.com", "password": "admin-password-123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # The returned token should be decodable and reference the admin user
        payload = decode_access_token(data["access_token"])
        assert payload is not None
        assert payload["sub"] == str(admin_user.id)

    # -----------------------------------------------------------------------
    # 5. Login failure (wrong password)
    # -----------------------------------------------------------------------

    async def test_login_wrong_password(
        self, client: AsyncClient, admin_user: User
    ):
        """Wrong password returns 401."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@ginkoposters.com", "password": "wrong-password"},
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    # -----------------------------------------------------------------------
    # 6. Login nonexistent user
    # -----------------------------------------------------------------------

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Unknown email returns 401."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@example.com", "password": "whatever"},
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    async def test_login_empty_password_rejected(self, client: AsyncClient):
        """An empty password is rejected at the schema level (422)."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@ginkoposters.com", "password": ""},
        )
        assert response.status_code == 422

    async def test_login_invalid_email_format(self, client: AsyncClient):
        """A malformed email address is rejected at the schema level (422)."""
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email", "password": "password123"},
        )
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# 7. GET /api/v1/auth/me (authenticated)
# ---------------------------------------------------------------------------


class TestMeEndpoint:
    """Tests for GET /api/v1/auth/me."""

    async def test_get_me_success(
        self,
        client: AsyncClient,
        admin_user: User,
        admin_headers: dict[str, str],
    ):
        """A valid token returns the current user's info."""
        response = await client.get("/api/v1/auth/me", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@ginkoposters.com"
        assert data["role"] == "admin"
        assert data["id"] == str(admin_user.id)

    # -----------------------------------------------------------------------
    # 8. GET /api/v1/auth/me (unauthorized)
    # -----------------------------------------------------------------------

    async def test_get_me_no_token(self, client: AsyncClient):
        """Request without an Authorization header is rejected."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code in (401, 403)

    async def test_get_me_invalid_token(self, client: AsyncClient):
        """An invalid token returns 401."""
        headers = {"Authorization": "Bearer invalid-token-value"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    async def test_get_me_user_deleted(
        self,
        client: AsyncClient,
        admin_user: User,
        admin_token: str,
        db_session: AsyncSession,
    ):
        """If the user referenced by the token no longer exists, return 401."""
        # Delete the user from the database
        await db_session.delete(admin_user)
        await db_session.flush()

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401
        assert "User not found" in response.json()["detail"]


# ---------------------------------------------------------------------------
# 9. Refresh token
# ---------------------------------------------------------------------------


class TestRefreshEndpoint:
    """Tests for POST /api/v1/auth/refresh."""

    async def test_refresh_token_success(
        self,
        client: AsyncClient,
        admin_user: User,
        admin_headers: dict[str, str],
    ):
        """A valid token can be refreshed for a new one."""
        response = await client.post("/api/v1/auth/refresh", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # The new token should reference the same user
        payload = decode_access_token(data["access_token"])
        assert payload is not None
        assert payload["sub"] == str(admin_user.id)

    async def test_refresh_token_no_auth(self, client: AsyncClient):
        """Refreshing without a token is rejected."""
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code in (401, 403)

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Refreshing with an invalid token returns 401."""
        headers = {"Authorization": "Bearer garbage-token"}
        response = await client.post("/api/v1/auth/refresh", headers=headers)
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# 10. Admin guard
# ---------------------------------------------------------------------------


class TestAdminGuard:
    """Tests for the require_admin dependency."""

    async def test_admin_user_passes_admin_guard(
        self, db_session: AsyncSession, admin_user: User
    ):
        """A user with role='admin' passes the require_admin check."""
        from src.auth.dependencies import require_admin

        # Directly call the dependency with the admin user
        result = await require_admin(user=admin_user)
        assert result is admin_user

    async def test_non_admin_user_rejected_by_admin_guard(
        self, db_session: AsyncSession
    ):
        """A user with a non-admin role is rejected with 403."""
        from fastapi import HTTPException

        from src.auth.dependencies import require_admin

        non_admin = User(
            id=uuid.uuid4(),
            email="viewer@ginkoposters.com",
            password_hash=hash_password("viewer-password"),
            role="viewer",
        )
        db_session.add(non_admin)
        await db_session.flush()

        with pytest.raises(HTTPException) as exc_info:
            await require_admin(user=non_admin)
        assert exc_info.value.status_code == 403
        assert "Admin access required" in exc_info.value.detail


# ---------------------------------------------------------------------------
# 11. Expired token
# ---------------------------------------------------------------------------


class TestExpiredToken:
    """Tests verifying that expired tokens are properly rejected."""

    async def test_expired_token_rejected_on_me_endpoint(
        self,
        client: AsyncClient,
        admin_user: User,
    ):
        """A token created in the past (now expired) is rejected with 401."""
        # Create a token that was issued 5 hours ago (expires 1 hour ago with 4-hour expiry)
        with freeze_time(datetime.now(timezone.utc) - timedelta(hours=5)):
            expired_token = create_access_token(admin_user.id)

        headers = {"Authorization": f"Bearer {expired_token}"}
        response = await client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    async def test_expired_token_rejected_on_refresh_endpoint(
        self,
        client: AsyncClient,
        admin_user: User,
    ):
        """An expired token cannot be used to refresh."""
        with freeze_time(datetime.now(timezone.utc) - timedelta(hours=5)):
            expired_token = create_access_token(admin_user.id)

        headers = {"Authorization": f"Bearer {expired_token}"}
        response = await client.post("/api/v1/auth/refresh", headers=headers)
        assert response.status_code == 401

    def test_decode_expired_token_returns_none(self):
        """decode_access_token returns None for an expired token."""
        user_id = uuid.uuid4()
        with freeze_time(datetime.now(timezone.utc) - timedelta(hours=5)):
            token = create_access_token(user_id)

        assert decode_access_token(token) is None


# ---------------------------------------------------------------------------
# authenticate_user service function
# ---------------------------------------------------------------------------


class TestAuthenticateUser:
    """Tests for the authenticate_user service function."""

    async def test_authenticate_user_valid(
        self, db_session: AsyncSession, admin_user: User
    ):
        """authenticate_user returns the user for valid credentials."""
        user = await authenticate_user(
            db_session, "admin@ginkoposters.com", "admin-password-123"
        )
        assert user is not None
        assert user.id == admin_user.id
        assert user.email == "admin@ginkoposters.com"

    async def test_authenticate_user_wrong_password(
        self, db_session: AsyncSession, admin_user: User
    ):
        """authenticate_user returns None for wrong password."""
        user = await authenticate_user(
            db_session, "admin@ginkoposters.com", "wrong-password"
        )
        assert user is None

    async def test_authenticate_user_nonexistent(self, db_session: AsyncSession):
        """authenticate_user returns None for an email that does not exist."""
        user = await authenticate_user(
            db_session, "noone@example.com", "any-password"
        )
        assert user is None
