"""Comprehensive tests for order creation, status, admin endpoints, and payment webhook handlers."""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.accounting.models import Transaction
from src.orders.models import Order, OrderItem
from src.orders.schemas import (
    OrderCreate,
    OrderItemCreate,
    OrderPublicResponse,
    OrderResponse,
    VALID_ORDER_STATUSES,
)
from src.orders.service import (
    create_order,
    get_order_by_id,
    get_order_status,
    list_orders,
    update_order_status,
)
from src.payments.service import (
    STRIPE_FEE_FIXED,
    STRIPE_FEE_PERCENT,
    handle_charge_refunded,
    handle_checkout_completed,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _order_payload(artist_id, variant_ids_and_quantities):
    """Build the JSON body for POST /api/v1/orders."""
    return {
        "artist_id": str(artist_id),
        "customer_email": "buyer@example.com",
        "customer_name": "Jane Doe",
        "shipping_address_line1": "42 Poster Lane",
        "shipping_city": "Berlin",
        "shipping_postal_code": "10115",
        "shipping_country": "DE",
        "items": [
            {"variant_id": str(vid), "quantity": qty}
            for vid, qty in variant_ids_and_quantities
        ],
    }


def _order_create_schema(artist_id, variant_ids_and_quantities):
    """Build an OrderCreate Pydantic model for direct service calls."""
    return OrderCreate(
        artist_id=artist_id,
        customer_email="buyer@example.com",
        customer_name="Jane Doe",
        shipping_address_line1="42 Poster Lane",
        shipping_city="Berlin",
        shipping_postal_code="10115",
        shipping_country="DE",
        items=[
            OrderItemCreate(variant_id=vid, quantity=qty)
            for vid, qty in variant_ids_and_quantities
        ],
    )


async def _reload_order_with_items(db: AsyncSession, order_id: uuid.UUID) -> Order:
    """Re-query an order with its items eagerly loaded."""
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one()


# ===================================================================
# Order Creation (via service + API for error paths)
# ===================================================================


class TestOrderCreation:
    """Tests for order creation logic."""

    async def test_create_order_success(
        self, db_session, artist_factory, product_factory, variant_factory
    ):
        """1. Create order successfully -- verify core fields and that the public
        response schema excludes cost_price and stripe_session_id."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=25.00, cost_price=7.00)

        data = _order_create_schema(artist.id, [(variant.id, 2)])
        order = await create_order(db_session, data)

        # Re-query with items loaded for full verification
        order = await _reload_order_with_items(db_session, order.id)

        assert order.status == "pending_payment"
        assert order.customer_email == "buyer@example.com"
        assert order.customer_name == "Jane Doe"
        assert order.artist_id == artist.id
        assert order.order_number.startswith("GK-")
        assert order.subtotal == 50.00  # 25.00 * 2

        # Items
        assert len(order.items) == 1
        item = order.items[0]
        assert item.variant_id == variant.id
        assert item.quantity == 2
        assert float(item.unit_price) == 25.00
        assert float(item.cost_price) == 7.00

        # Verify the public response schema strips sensitive fields
        public = OrderPublicResponse.model_validate(order)
        public_dict = public.model_dump()
        assert "stripe_session_id" not in public_dict
        # Public item should NOT have cost_price
        public_item_keys = set(public_dict["items"][0].keys())
        assert "cost_price" not in public_item_keys

        # Verify admin schema includes them
        admin = OrderResponse.model_validate(order)
        admin_dict = admin.model_dump()
        assert "stripe_session_id" in admin_dict
        admin_item_keys = set(admin_dict["items"][0].keys())
        assert "cost_price" in admin_item_keys

    async def test_create_order_invalid_variant_id(
        self, client, db_session, artist_factory
    ):
        """2. Create order with invalid variant_id -- returns 400."""
        artist = await artist_factory()
        fake_variant_id = uuid.uuid4()

        payload = _order_payload(artist.id, [(fake_variant_id, 1)])
        resp = await client.post("/api/v1/orders", json=payload)

        assert resp.status_code == 400
        assert "not found" in resp.json()["detail"].lower()

    async def test_create_order_variant_belongs_to_different_artist(
        self, client, db_session, artist_factory, product_factory, variant_factory
    ):
        """3. Variant belongs to artist B, but order references artist A -- returns 400."""
        artist_a = await artist_factory(name="Artist A")
        artist_b = await artist_factory(name="Artist B")
        product_b = await product_factory(artist_b.id)
        variant_b = await variant_factory(product_b.id, price=19.99, cost_price=5.00)

        payload = _order_payload(artist_a.id, [(variant_b.id, 1)])
        resp = await client.post("/api/v1/orders", json=payload)

        assert resp.status_code == 400
        assert "does not belong" in resp.json()["detail"].lower()

    async def test_create_order_price_calculation(
        self, db_session, artist_factory, product_factory, variant_factory
    ):
        """4. Subtotal equals sum of (variant price * quantity) across items."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        v1 = await variant_factory(product.id, price=15.00, cost_price=4.00, sku="CALC-001")
        v2 = await variant_factory(product.id, price=30.00, cost_price=9.00, sku="CALC-002")

        data = _order_create_schema(artist.id, [(v1.id, 3), (v2.id, 2)])
        order = await create_order(db_session, data)
        order = await _reload_order_with_items(db_session, order.id)

        expected_subtotal = 15.00 * 3 + 30.00 * 2  # 45 + 60 = 105
        assert float(order.subtotal) == expected_subtotal

        # Verify individual item line totals
        items_by_variant = {item.variant_id: item for item in order.items}
        assert float(items_by_variant[v1.id].unit_price) == 15.00
        assert items_by_variant[v1.id].quantity == 3
        assert float(items_by_variant[v2.id].unit_price) == 30.00
        assert items_by_variant[v2.id].quantity == 2

    async def test_create_order_api_success(
        self, client, db_session, artist_factory, product_factory, variant_factory
    ):
        """POST /api/v1/orders returns 201 with public response (no cost_price/stripe_session_id)."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=25.00, cost_price=7.00)

        payload = _order_payload(artist.id, [(variant.id, 1)])
        resp = await client.post("/api/v1/orders", json=payload)

        assert resp.status_code == 201
        data = resp.json()
        assert data["customer_email"] == "buyer@example.com"
        assert data["status"] == "pending_payment"
        assert float(data["subtotal"]) == 25.00
        assert len(data["items"]) == 1
        # Public response should not contain sensitive fields
        assert "stripe_session_id" not in data
        assert "cost_price" not in data["items"][0]


# ===================================================================
# Order Status (public endpoint)
# ===================================================================


class TestOrderStatus:
    """GET /api/v1/orders/{order_id}/status"""

    async def test_get_order_status_success(
        self, client, db_session, artist_factory, product_factory, variant_factory, order_factory
    ):
        """5. Public endpoint returns id, order_number, status, created_at."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id)
        order = await order_factory(artist.id, [variant], status="paid")

        resp = await client.get(f"/api/v1/orders/{order.id}/status")

        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == str(order.id)
        assert data["order_number"] == order.order_number
        assert data["status"] == "paid"
        assert "created_at" in data

        # Should NOT expose full order details
        assert "customer_email" not in data
        assert "items" not in data

    async def test_get_order_status_not_found(self, client):
        """6. Nonexistent order ID returns 404."""
        fake_id = uuid.uuid4()
        resp = await client.get(f"/api/v1/orders/{fake_id}/status")

        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()

    async def test_admin_update_order_status(
        self,
        db_session,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """7. Admin can update order status successfully (service-level test)."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id)
        order = await order_factory(artist.id, [variant], status="paid")

        updated = await update_order_status(
            db_session, order.id, "shipped", notes="Tracking: ABC123"
        )
        assert updated is not None

        # Re-query to verify persistence
        reloaded = await _reload_order_with_items(db_session, order.id)
        assert reloaded.status == "shipped"
        assert reloaded.notes == "Tracking: ABC123"

    async def test_admin_update_order_status_invalid_status_via_api(
        self,
        client,
        db_session,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """8. Invalid status string is rejected by Pydantic validation (422)."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id)
        order = await order_factory(artist.id, [variant])

        resp = await client.patch(
            f"/api/v1/admin/orders/{order.id}/status",
            json={"status": "nonexistent_status"},
            headers=admin_headers,
        )

        # Pydantic Literal validation rejects before hitting the service
        assert resp.status_code == 422

    async def test_update_order_status_invalid_status_via_service(
        self,
        db_session,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """8b. Service-level validation also rejects invalid status strings."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id)
        order = await order_factory(artist.id, [variant])

        with pytest.raises(ValueError, match="Invalid order status"):
            await update_order_status(db_session, order.id, "bogus_status")

    async def test_update_order_status_nonexistent_order(self, db_session):
        """update_order_status returns None for nonexistent order."""
        result = await update_order_status(db_session, uuid.uuid4(), "paid")
        assert result is None


# ===================================================================
# Admin Orders
# ===================================================================


class TestAdminOrders:
    """GET /api/v1/admin/orders and related admin operations."""

    async def test_admin_list_orders_requires_auth(self, client):
        """9. Request without token returns 401 or 403."""
        resp = await client.get("/api/v1/admin/orders")
        assert resp.status_code in (401, 403)

    async def test_admin_list_orders_with_auth(
        self,
        client,
        db_session,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """10. Admin list returns full OrderResponse with stripe_session_id and cost_price."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=35.00, cost_price=10.00)
        order = await order_factory(artist.id, [variant], status="paid")

        # Set stripe_session_id so we can verify it appears in admin response
        order.stripe_session_id = "cs_test_admin_list"
        await db_session.flush()

        resp = await client.get("/api/v1/admin/orders", headers=admin_headers)

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1

        order_data = next(o for o in data if o["id"] == str(order.id))
        # Admin-only fields present
        assert order_data["stripe_session_id"] == "cs_test_admin_list"
        assert len(order_data["items"]) == 1
        assert order_data["items"][0]["cost_price"] == 10.00

    async def test_admin_filter_orders_by_artist_and_status(
        self,
        client,
        db_session,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """11. Filter orders by artist_id and status query params."""
        artist_a = await artist_factory(name="Filter A")
        artist_b = await artist_factory(name="Filter B")
        prod_a = await product_factory(artist_a.id)
        prod_b = await product_factory(artist_b.id)
        v_a = await variant_factory(prod_a.id, price=10.00, cost_price=3.00, sku="FILT-A")
        v_b = await variant_factory(prod_b.id, price=20.00, cost_price=6.00, sku="FILT-B")

        await order_factory(artist_a.id, [v_a], status="paid")
        await order_factory(artist_a.id, [v_a], status="shipped")
        await order_factory(artist_b.id, [v_b], status="paid")

        # Filter by artist_a -- should return 2 orders
        resp = await client.get(
            f"/api/v1/admin/orders?artist_id={artist_a.id}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert all(o["artist_id"] == str(artist_a.id) for o in data)

        # Filter by artist_a + status=paid -- should return 1
        resp = await client.get(
            f"/api/v1/admin/orders?artist_id={artist_a.id}&status=paid",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["status"] == "paid"

        # Filter by status=paid only -- should return 2 (one per artist)
        resp = await client.get(
            "/api/v1/admin/orders?status=paid",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2


# ===================================================================
# Payment Webhook Handlers (unit tests on service functions)
# ===================================================================


class TestPaymentWebhooks:
    """Direct tests of handle_checkout_completed and handle_charge_refunded."""

    async def test_handle_checkout_completed(
        self, db_session, artist_factory, product_factory, variant_factory, order_factory
    ):
        """12. Sets status to 'paid' and creates a Transaction with correct financials."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=50.00, cost_price=12.00)
        order = await order_factory(artist.id, [variant], status="pending_payment")

        # Attach stripe identifiers
        order.stripe_session_id = "cs_test_checkout_123"
        await db_session.flush()

        # Mock stripe.checkout.Session.retrieve
        mock_session = MagicMock()
        mock_session.payment_intent = "pi_test_checkout_123"

        with patch("src.payments.service.stripe.checkout.Session.retrieve", return_value=mock_session):
            await handle_checkout_completed(db_session, "cs_test_checkout_123")

        # Refresh order to see updated status
        await db_session.refresh(order)
        assert order.status == "paid"
        assert order.stripe_payment_intent_id == "pi_test_checkout_123"

        # Verify Transaction was created
        result = await db_session.execute(
            select(Transaction).where(Transaction.order_id == order.id)
        )
        txn = result.scalar_one()
        assert txn.type == "sale"
        assert txn.artist_id == artist.id

        # Verify financial calculations
        expected_revenue = 50.00
        expected_cogs = 12.00  # cost_price * quantity(1)
        expected_stripe_fee = round(expected_revenue * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED, 2)
        expected_net = round(expected_revenue - expected_cogs - expected_stripe_fee, 2)

        assert float(txn.revenue) == expected_revenue
        assert float(txn.cogs) == expected_cogs
        assert float(txn.stripe_fee) == expected_stripe_fee
        assert float(txn.net_profit) == expected_net

    async def test_handle_checkout_completed_idempotency(
        self, db_session, artist_factory, product_factory, variant_factory, order_factory
    ):
        """13. Skips processing if order status is not 'pending_payment' (already paid)."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=40.00, cost_price=10.00)
        order = await order_factory(artist.id, [variant], status="paid")

        order.stripe_session_id = "cs_test_idempotent"
        await db_session.flush()

        with patch("src.payments.service.stripe.checkout.Session.retrieve") as mock_retrieve:
            await handle_checkout_completed(db_session, "cs_test_idempotent")
            # stripe.checkout.Session.retrieve should NOT be called
            mock_retrieve.assert_not_called()

        # Status remains "paid", no new transactions
        await db_session.refresh(order)
        assert order.status == "paid"

        result = await db_session.execute(
            select(Transaction).where(Transaction.order_id == order.id)
        )
        assert result.scalar_one_or_none() is None

    async def test_handle_charge_refunded(
        self, db_session, artist_factory, product_factory, variant_factory, order_factory
    ):
        """14. Sets status to 'refunded' and creates refund Transaction with negative values."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        v1 = await variant_factory(product.id, price=25.00, cost_price=7.50, sku="REF-001")
        v2 = await variant_factory(product.id, price=35.00, cost_price=10.00, sku="REF-002")
        order = await order_factory(artist.id, [v1, v2], status="paid")

        order.stripe_payment_intent_id = "pi_test_refund_456"
        await db_session.flush()

        await handle_charge_refunded(db_session, "pi_test_refund_456")

        await db_session.refresh(order)
        assert order.status == "refunded"

        # Verify refund Transaction
        result = await db_session.execute(
            select(Transaction).where(Transaction.order_id == order.id)
        )
        txn = result.scalar_one()
        assert txn.type == "refund"

        total_revenue = 25.00 + 35.00  # subtotal (qty=1 each)
        total_cogs = 7.50 + 10.00
        expected_stripe_fee = round(total_revenue * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED, 2)

        # All values should be negative for a refund
        assert float(txn.revenue) == -total_revenue
        assert float(txn.cogs) == -total_cogs
        assert float(txn.stripe_fee) == -expected_stripe_fee
        expected_net = round(-total_revenue + total_cogs + expected_stripe_fee, 2)
        assert float(txn.net_profit) == expected_net

    async def test_handle_charge_refunded_nonexistent_order(self, db_session):
        """15. Refund for unknown payment_intent returns gracefully (no error)."""
        # Should not raise -- just returns silently
        await handle_charge_refunded(db_session, "pi_does_not_exist")

        # Verify no transactions were created at all
        result = await db_session.execute(select(Transaction))
        assert result.scalars().all() == []

    async def test_handle_checkout_completed_nonexistent_session(self, db_session):
        """Checkout completed for unknown session_id returns gracefully."""
        with patch("src.payments.service.stripe.checkout.Session.retrieve") as mock_retrieve:
            await handle_checkout_completed(db_session, "cs_nonexistent")
            mock_retrieve.assert_not_called()

        result = await db_session.execute(select(Transaction))
        assert result.scalars().all() == []

    async def test_handle_checkout_completed_multi_item_financials(
        self, db_session, artist_factory, product_factory, variant_factory, order_factory
    ):
        """Verify financial calculations with multiple items at different quantities."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        v1 = await variant_factory(product.id, price=20.00, cost_price=6.00, sku="FIN-001")
        v2 = await variant_factory(product.id, price=40.00, cost_price=12.00, sku="FIN-002")

        # order_factory creates qty=1 per variant, subtotal = 20 + 40 = 60
        order = await order_factory(artist.id, [v1, v2], status="pending_payment")
        order.stripe_session_id = "cs_test_multi"
        await db_session.flush()

        mock_session = MagicMock()
        mock_session.payment_intent = "pi_test_multi"

        with patch("src.payments.service.stripe.checkout.Session.retrieve", return_value=mock_session):
            await handle_checkout_completed(db_session, "cs_test_multi")

        result = await db_session.execute(
            select(Transaction).where(Transaction.order_id == order.id)
        )
        txn = result.scalar_one()

        expected_revenue = 60.00
        expected_cogs = 6.00 + 12.00  # 18.00
        expected_stripe_fee = round(60.00 * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED, 2)
        expected_net = round(expected_revenue - expected_cogs - expected_stripe_fee, 2)

        assert float(txn.revenue) == expected_revenue
        assert float(txn.cogs) == expected_cogs
        assert float(txn.stripe_fee) == expected_stripe_fee
        assert float(txn.net_profit) == expected_net
