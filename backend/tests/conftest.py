import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.artists.models import Artist
from src.auth.models import User
from src.auth.service import create_access_token, hash_password
from src.base_model import Base
from src.dependencies import get_db
from src.main import app
from src.orders.models import Order, OrderItem
from src.products.models import Product, ProductVariant

# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

TestSessionFactory = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(autouse=True)
async def setup_database():
    """Create all tables before each test and drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional database session for tests."""
    async with TestSessionFactory() as session:
        yield session


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP test client with DB override."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

@pytest.fixture
async def admin_user(db_session: AsyncSession) -> User:
    """Create and return an admin user."""
    user = User(
        id=uuid.uuid4(),
        email="admin@ginkoposters.com",
        password_hash=hash_password("admin-password-123"),
        role="admin",
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
async def admin_token(admin_user: User) -> str:
    """Return a valid JWT for the admin user."""
    return create_access_token(admin_user.id)


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    """Return auth headers for admin requests."""
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------------------------------------------------------------------
# Factory helpers
# ---------------------------------------------------------------------------

@pytest.fixture
async def artist_factory(db_session: AsyncSession):
    """Factory for creating Artist records."""
    _counter = 0

    async def _create(**overrides) -> Artist:
        nonlocal _counter
        _counter += 1
        defaults = {
            "id": uuid.uuid4(),
            "name": f"Test Artist {_counter}",
            "slug": f"test-artist-{_counter}",
            "domain": f"artist{_counter}.example.com",
            "primary_color": "#000000",
            "secondary_color": "#FFFFFF",
            "is_active": True,
        }
        defaults.update(overrides)
        artist = Artist(**defaults)
        db_session.add(artist)
        await db_session.flush()
        return artist

    return _create


@pytest.fixture
async def product_factory(db_session: AsyncSession):
    """Factory for creating Product records."""
    _counter = 0

    async def _create(artist_id: uuid.UUID, **overrides) -> Product:
        nonlocal _counter
        _counter += 1
        defaults = {
            "id": uuid.uuid4(),
            "artist_id": artist_id,
            "title": f"Test Poster {_counter}",
            "slug": f"test-poster-{_counter}",
            "is_active": True,
        }
        defaults.update(overrides)
        product = Product(**defaults)
        db_session.add(product)
        await db_session.flush()
        return product

    return _create


@pytest.fixture
async def variant_factory(db_session: AsyncSession):
    """Factory for creating ProductVariant records."""
    _counter = 0

    async def _create(product_id: uuid.UUID, **overrides) -> ProductVariant:
        nonlocal _counter
        _counter += 1
        defaults = {
            "id": uuid.uuid4(),
            "product_id": product_id,
            "size": "A3",
            "sku": f"SKU-{_counter:04d}",
            "price": 29.99,
            "cost_price": 8.50,
        }
        defaults.update(overrides)
        variant = ProductVariant(**defaults)
        db_session.add(variant)
        await db_session.flush()
        return variant

    return _create


@pytest.fixture
async def order_factory(db_session: AsyncSession):
    """Factory for creating Order records with items."""

    async def _create(
        artist_id: uuid.UUID,
        variants: list[ProductVariant],
        *,
        status: str = "pending_payment",
        **overrides,
    ) -> Order:
        defaults = {
            "id": uuid.uuid4(),
            "order_number": f"GK-TEST-{uuid.uuid4().hex[:6].upper()}",
            "artist_id": artist_id,
            "customer_email": "customer@example.com",
            "customer_name": "Test Customer",
            "shipping_address_line1": "123 Test Street",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "DE",
            "status": status,
            "subtotal": sum(float(v.price) for v in variants),
        }
        defaults.update(overrides)
        order = Order(**defaults)
        db_session.add(order)
        await db_session.flush()

        for variant in variants:
            item = OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                variant_id=variant.id,
                quantity=1,
                unit_price=float(variant.price),
                cost_price=float(variant.cost_price),
            )
            db_session.add(item)

        await db_session.flush()
        return order

    return _create
