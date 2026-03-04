"""Comprehensive tests for admin endpoints and input validation."""

import csv
import io
import uuid

import pytest
from httpx import AsyncClient


# ===========================================================================
# Auth required on all admin endpoints
# ===========================================================================


class TestAdminAuthRequired:
    """Every admin endpoint must reject unauthenticated requests.

    Requests without any token and requests with an invalid token both
    receive 401.  We test both scenarios to ensure the auth gate is
    applied consistently.
    """

    # -- No token at all --

    async def test_get_admin_artists_no_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/admin/artists")
        assert resp.status_code in (401, 403)

    async def test_post_admin_artists_no_token(self, client: AsyncClient):
        resp = await client.post("/api/v1/admin/artists", json={
            "name": "Hacker",
            "slug": "hacker",
            "domain": "hacker.com",
        })
        assert resp.status_code in (401, 403)

    async def test_get_admin_products_no_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/admin/products")
        assert resp.status_code in (401, 403)

    async def test_post_admin_products_no_token(self, client: AsyncClient):
        resp = await client.post("/api/v1/admin/products", json={
            "artist_id": str(uuid.uuid4()),
            "title": "Evil Poster",
            "slug": "evil",
        })
        assert resp.status_code in (401, 403)

    async def test_get_admin_orders_no_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/admin/orders")
        assert resp.status_code in (401, 403)

    async def test_post_fulfillment_export_csv_no_token(self, client: AsyncClient):
        resp = await client.post("/api/v1/admin/fulfillment/export-csv", json={
            "order_ids": [str(uuid.uuid4())],
        })
        assert resp.status_code in (401, 403)

    async def test_get_accounting_summary_no_token(self, client: AsyncClient):
        resp = await client.get(
            "/api/v1/admin/accounting/summary",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
        )
        assert resp.status_code in (401, 403)

    # -- Invalid token (returns 401) --

    async def test_get_admin_artists_invalid_token(self, client: AsyncClient):
        headers = {"Authorization": "Bearer invalid-garbage-token"}
        resp = await client.get("/api/v1/admin/artists", headers=headers)
        assert resp.status_code == 401

    async def test_post_admin_artists_invalid_token(self, client: AsyncClient):
        headers = {"Authorization": "Bearer invalid-garbage-token"}
        resp = await client.post(
            "/api/v1/admin/artists",
            json={"name": "X", "slug": "x", "domain": "x.com"},
            headers=headers,
        )
        assert resp.status_code == 401

    async def test_get_admin_orders_invalid_token(self, client: AsyncClient):
        headers = {"Authorization": "Bearer invalid-garbage-token"}
        resp = await client.get("/api/v1/admin/orders", headers=headers)
        assert resp.status_code == 401

    async def test_fulfillment_export_csv_invalid_token(self, client: AsyncClient):
        headers = {"Authorization": "Bearer invalid-garbage-token"}
        resp = await client.post(
            "/api/v1/admin/fulfillment/export-csv",
            json={"order_ids": [str(uuid.uuid4())]},
            headers=headers,
        )
        assert resp.status_code == 401

    async def test_accounting_summary_invalid_token(self, client: AsyncClient):
        headers = {"Authorization": "Bearer invalid-garbage-token"}
        resp = await client.get(
            "/api/v1/admin/accounting/summary",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=headers,
        )
        assert resp.status_code == 401


# ===========================================================================
# Artist CRUD
# ===========================================================================


class TestArtistCRUD:
    """Tests for admin and public artist endpoints."""

    async def test_create_artist_via_admin(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Yuki Tanaka",
            "slug": "yuki-tanaka",
            "domain": "yuki.ginkoposters.com",
            "primary_color": "#FF5733",
            "secondary_color": "#335BFF",
            "bio": "Japanese woodblock artist",
            "logo_url": "https://cdn.example.com/yuki-logo.png",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)

        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Yuki Tanaka"
        assert data["slug"] == "yuki-tanaka"
        assert data["domain"] == "yuki.ginkoposters.com"
        assert data["primary_color"] == "#FF5733"
        assert data["secondary_color"] == "#335BFF"
        assert data["bio"] == "Japanese woodblock artist"
        assert data["logo_url"] == "https://cdn.example.com/yuki-logo.png"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    async def test_update_artist_via_admin(
        self, client: AsyncClient, admin_headers, artist_factory
    ):
        artist = await artist_factory(name="Original Name")

        resp = await client.put(
            f"/api/v1/admin/artists/{artist.id}",
            json={"name": "Updated Name", "bio": "New bio text"},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Updated Name"
        assert data["bio"] == "New bio text"
        # Unchanged fields should persist
        assert data["slug"] == artist.slug
        assert data["domain"] == artist.domain

    async def test_update_artist_deactivate(
        self, client: AsyncClient, admin_headers, artist_factory
    ):
        artist = await artist_factory()

        resp = await client.put(
            f"/api/v1/admin/artists/{artist.id}",
            json={"is_active": False},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

    async def test_update_nonexistent_artist_returns_404(
        self, client: AsyncClient, admin_headers
    ):
        fake_id = uuid.uuid4()
        resp = await client.put(
            f"/api/v1/admin/artists/{fake_id}",
            json={"name": "Ghost"},
            headers=admin_headers,
        )
        assert resp.status_code == 404

    async def test_admin_list_artists_includes_inactive(
        self, client: AsyncClient, admin_headers, artist_factory
    ):
        await artist_factory(name="Active Artist", is_active=True)
        await artist_factory(name="Inactive Artist", is_active=False)

        resp = await client.get("/api/v1/admin/artists", headers=admin_headers)
        assert resp.status_code == 200

        data = resp.json()
        names = [a["name"] for a in data]
        assert "Active Artist" in names
        assert "Inactive Artist" in names

    async def test_public_artist_list_excludes_inactive(
        self, client: AsyncClient, artist_factory
    ):
        await artist_factory(name="Visible Artist", is_active=True)
        await artist_factory(name="Hidden Artist", is_active=False)

        resp = await client.get("/api/v1/artists/")
        assert resp.status_code == 200

        data = resp.json()
        names = [a["name"] for a in data]
        assert "Visible Artist" in names
        assert "Hidden Artist" not in names

    async def test_get_artist_by_domain(self, client: AsyncClient, artist_factory):
        artist = await artist_factory(domain="special.example.com")

        resp = await client.get("/api/v1/artists/by-domain/special.example.com")
        assert resp.status_code == 200

        data = resp.json()
        assert data["id"] == str(artist.id)
        assert data["domain"] == "special.example.com"

    async def test_get_artist_by_domain_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/artists/by-domain/nonexistent.example.com")
        assert resp.status_code == 404

    async def test_get_artist_by_slug(self, client: AsyncClient, artist_factory):
        artist = await artist_factory(slug="cool-artist")

        resp = await client.get("/api/v1/artists/by-slug/cool-artist")
        assert resp.status_code == 200

        data = resp.json()
        assert data["id"] == str(artist.id)
        assert data["slug"] == "cool-artist"

    async def test_get_artist_by_slug_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/artists/by-slug/no-such-slug")
        assert resp.status_code == 404


# ===========================================================================
# Product CRUD
# ===========================================================================


class TestProductCRUD:
    """Tests for admin and public product endpoints."""

    async def test_create_product_with_variants(
        self, client: AsyncClient, admin_headers, artist_factory
    ):
        artist = await artist_factory()

        payload = {
            "artist_id": str(artist.id),
            "title": "Sunset Over Tokyo",
            "slug": "sunset-over-tokyo",
            "description": "A beautiful sunset print",
            "image_url": "https://cdn.example.com/sunset.jpg",
            "print_file_key": "prints/sunset-tokyo-hires.tiff",
            "variants": [
                {"size": "A4", "sku": "SUN-A4", "price": 19.99, "cost_price": 5.00},
                {"size": "A3", "sku": "SUN-A3", "price": 29.99, "cost_price": 8.50},
                {"size": "A2", "sku": "SUN-A2", "price": 49.99, "cost_price": 14.00},
            ],
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)

        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Sunset Over Tokyo"
        assert data["slug"] == "sunset-over-tokyo"
        assert data["description"] == "A beautiful sunset print"
        assert data["artist_id"] == str(artist.id)
        assert data["is_active"] is True
        assert len(data["variants"]) == 3

        # Admin response must include cost_price and sku
        skus = {v["sku"] for v in data["variants"]}
        assert skus == {"SUN-A4", "SUN-A3", "SUN-A2"}
        for variant in data["variants"]:
            assert "cost_price" in variant
            assert "sku" in variant
            assert "id" in variant
            assert "product_id" in variant

    async def test_create_product_without_variants(
        self, client: AsyncClient, admin_headers, artist_factory
    ):
        artist = await artist_factory()

        payload = {
            "artist_id": str(artist.id),
            "title": "Minimal Poster",
            "slug": "minimal-poster",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)

        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Minimal Poster"
        assert data["variants"] == []

    async def test_update_product(
        self, client: AsyncClient, admin_headers, artist_factory, product_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id, title="Old Title")

        resp = await client.put(
            f"/api/v1/admin/products/{product.id}",
            json={"title": "New Title", "description": "Updated description"},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "New Title"
        assert data["description"] == "Updated description"
        assert data["slug"] == product.slug  # unchanged

    async def test_update_product_deactivate(
        self, client: AsyncClient, admin_headers, artist_factory, product_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)

        resp = await client.put(
            f"/api/v1/admin/products/{product.id}",
            json={"is_active": False},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["is_active"] is False

    async def test_update_nonexistent_product_returns_404(
        self, client: AsyncClient, admin_headers
    ):
        fake_id = uuid.uuid4()
        resp = await client.put(
            f"/api/v1/admin/products/{fake_id}",
            json={"title": "Ghost Product"},
            headers=admin_headers,
        )
        assert resp.status_code == 404

    async def test_public_product_excludes_cost_price_and_sku(
        self, client: AsyncClient, artist_factory, product_factory, variant_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(
            product.id, size="A3", sku="SECRET-SKU", price=29.99, cost_price=8.50
        )

        resp = await client.get(f"/api/v1/products/{product.id}")
        assert resp.status_code == 200

        data = resp.json()
        assert len(data["variants"]) == 1
        pub_variant = data["variants"][0]
        # Public response should have these fields
        assert pub_variant["id"] == str(variant.id)
        assert pub_variant["size"] == "A3"
        assert pub_variant["price"] == 29.99
        # Public response must NOT have cost_price or sku
        assert "cost_price" not in pub_variant
        assert "sku" not in pub_variant

    async def test_admin_product_includes_cost_price_and_sku(
        self, client: AsyncClient, admin_headers, artist_factory, product_factory, variant_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        await variant_factory(
            product.id, size="A3", sku="ADM-SKU-001", price=29.99, cost_price=8.50
        )

        resp = await client.get("/api/v1/admin/products", headers=admin_headers)
        assert resp.status_code == 200

        data = resp.json()
        # Find our product
        matched = [p for p in data if p["id"] == str(product.id)]
        assert len(matched) == 1

        admin_variant = matched[0]["variants"][0]
        assert admin_variant["sku"] == "ADM-SKU-001"
        assert admin_variant["cost_price"] == 8.50
        assert admin_variant["price"] == 29.99

    async def test_list_products_by_artist_public_only_active(
        self, client: AsyncClient, artist_factory, product_factory
    ):
        artist = await artist_factory()
        await product_factory(artist.id, title="Active Poster", is_active=True)
        await product_factory(artist.id, title="Hidden Poster", is_active=False)

        resp = await client.get(f"/api/v1/artists/{artist.id}/products")
        assert resp.status_code == 200

        data = resp.json()
        titles = [p["title"] for p in data]
        assert "Active Poster" in titles
        assert "Hidden Poster" not in titles

    async def test_get_single_product_not_found(self, client: AsyncClient):
        fake_id = uuid.uuid4()
        resp = await client.get(f"/api/v1/products/{fake_id}")
        assert resp.status_code == 404


# ===========================================================================
# Fulfillment
# ===========================================================================


class TestFulfillment:
    """Tests for order fulfillment endpoints (admin only)."""

    async def test_export_csv_returns_csv_content(
        self,
        client: AsyncClient,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, sku="CSV-TEST-001", price=25.00, cost_price=7.00)
        order = await order_factory(artist.id, [variant], status="paid")

        resp = await client.post(
            "/api/v1/admin/fulfillment/export-csv",
            json={"order_ids": [str(order.id)]},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        assert "text/csv" in resp.headers.get("content-type", "")

        # Parse CSV content
        reader = csv.reader(io.StringIO(resp.text))
        rows = list(reader)

        # Header row
        assert rows[0][0] == "Order Number"
        assert rows[0][1] == "SKU"
        assert rows[0][2] == "Quantity"
        assert rows[0][3] == "Customer Name"

        # Data row
        assert len(rows) >= 2
        data_row = rows[1]
        assert data_row[0] == order.order_number
        assert data_row[1] == "CSV-TEST-001"
        assert data_row[2] == "1"
        assert data_row[3] == "Test Customer"

    async def test_export_csv_multiple_orders(
        self,
        client: AsyncClient,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        v1 = await variant_factory(product.id, sku="MULTI-001", price=20.00, cost_price=5.00)
        v2 = await variant_factory(product.id, sku="MULTI-002", size="A2", price=40.00, cost_price=12.00)

        order1 = await order_factory(artist.id, [v1], status="paid")
        order2 = await order_factory(artist.id, [v2], status="paid")

        resp = await client.post(
            "/api/v1/admin/fulfillment/export-csv",
            json={"order_ids": [str(order1.id), str(order2.id)]},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        reader = csv.reader(io.StringIO(resp.text))
        rows = list(reader)
        # Header + 2 data rows
        assert len(rows) == 3

    async def test_mark_orders_sent_updates_status(
        self,
        client: AsyncClient,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=30.00, cost_price=9.00)
        order = await order_factory(artist.id, [variant], status="paid")

        resp = await client.post(
            "/api/v1/admin/fulfillment/mark-sent",
            json={"order_ids": [str(order.id)]},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["updated_count"] == 1

    async def test_mark_sent_only_updates_paid_orders(
        self,
        client: AsyncClient,
        admin_headers,
        artist_factory,
        product_factory,
        variant_factory,
        order_factory,
    ):
        """Only orders with status 'paid' should be transitioned."""
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=30.00, cost_price=9.00)

        paid_order = await order_factory(artist.id, [variant], status="paid")
        pending_order = await order_factory(artist.id, [variant], status="pending_payment")

        resp = await client.post(
            "/api/v1/admin/fulfillment/mark-sent",
            json={"order_ids": [str(paid_order.id), str(pending_order.id)]},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        # Only the paid order should be updated
        assert data["updated_count"] == 1

    async def test_mark_sent_with_nonexistent_order_ids(
        self, client: AsyncClient, admin_headers
    ):
        """Nonexistent order IDs should result in zero updates."""
        resp = await client.post(
            "/api/v1/admin/fulfillment/mark-sent",
            json={"order_ids": [str(uuid.uuid4())]},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        assert resp.json()["updated_count"] == 0


# ===========================================================================
# Accounting
# ===========================================================================


class TestAccounting:
    """Tests for accounting admin endpoints."""

    async def test_accounting_summary_returns_structure(
        self, client: AsyncClient, admin_headers
    ):
        resp = await client.get(
            "/api/v1/admin/accounting/summary",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        assert "total_revenue" in data
        assert "total_cogs" in data
        assert "total_stripe_fees" in data
        assert "total_net_profit" in data
        assert "transaction_count" in data

    async def test_daily_digest_returns_csv(self, client: AsyncClient, admin_headers):
        resp = await client.get(
            "/api/v1/admin/accounting/daily-digest",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=admin_headers,
        )

        assert resp.status_code == 200
        assert "text/csv" in resp.headers.get("content-type", "")

    async def test_artist_payouts_returns_list(self, client: AsyncClient, admin_headers):
        resp = await client.get(
            "/api/v1/admin/accounting/artist-payouts",
            headers=admin_headers,
        )

        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)


# ===========================================================================
# Input validation (schema enforcement)
# ===========================================================================


class TestInputValidation:
    """Tests that Pydantic schema validation rejects malformed input."""

    # -- Artist slug validation --

    async def test_artist_slug_rejects_uppercase(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Bad Slug Artist",
            "slug": "Bad-Slug",  # uppercase B and S
            "domain": "bad.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_slug_rejects_spaces(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Space Slug",
            "slug": "has spaces",
            "domain": "space.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_slug_rejects_special_chars(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Special Chars",
            "slug": "slug_with_underscores!",
            "domain": "special.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_slug_accepts_valid_pattern(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Good Artist",
            "slug": "good-artist-123",
            "domain": "good.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 201

    # -- Product slug validation --

    async def test_product_slug_rejects_uppercase(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "Bad Product",
            "slug": "Bad-Slug",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_slug_rejects_special_chars(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "Bad Product",
            "slug": "slug_with_underscores!",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_slug_accepts_valid_pattern(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "Good Product",
            "slug": "good-product-99",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 201

    # -- Order country code validation --

    async def test_order_country_must_be_2_uppercase_letters(
        self, client: AsyncClient, artist_factory, product_factory, variant_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=20.00, cost_price=5.00)

        payload = {
            "artist_id": str(artist.id),
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "shipping_address_line1": "123 Main St",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "de",  # lowercase, should fail
            "items": [{"variant_id": str(variant.id), "quantity": 1}],
        }
        resp = await client.post("/api/v1/orders", json=payload)
        assert resp.status_code == 422

    async def test_order_country_rejects_three_letter_code(
        self, client: AsyncClient, artist_factory, product_factory, variant_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=20.00, cost_price=5.00)

        payload = {
            "artist_id": str(artist.id),
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "shipping_address_line1": "123 Main St",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "DEU",  # 3 letters, should fail
            "items": [{"variant_id": str(variant.id), "quantity": 1}],
        }
        resp = await client.post("/api/v1/orders", json=payload)
        assert resp.status_code == 422

    async def test_order_country_rejects_numeric(
        self, client: AsyncClient, artist_factory, product_factory, variant_factory
    ):
        artist = await artist_factory()
        product = await product_factory(artist.id)
        variant = await variant_factory(product.id, price=20.00, cost_price=5.00)

        payload = {
            "artist_id": str(artist.id),
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "shipping_address_line1": "123 Main St",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "12",  # numeric, should fail
            "items": [{"variant_id": str(variant.id), "quantity": 1}],
        }
        resp = await client.post("/api/v1/orders", json=payload)
        assert resp.status_code == 422

    # -- Empty / missing required fields --

    async def test_artist_name_required(self, client: AsyncClient, admin_headers):
        payload = {
            "slug": "no-name",
            "domain": "noname.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_slug_required(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "No Slug",
            "domain": "noslug.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_domain_required(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "No Domain",
            "slug": "no-domain",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_empty_name_rejected(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "",
            "slug": "empty-name",
            "domain": "empty.example.com",
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_title_required(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "slug": "no-title",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_slug_required(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "No Slug Product",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_artist_id_required(self, client: AsyncClient, admin_headers):
        payload = {
            "title": "Orphan Product",
            "slug": "orphan-product",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_product_empty_title_rejected(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "",
            "slug": "empty-title",
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_variant_price_must_be_positive(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "Zero Price",
            "slug": "zero-price",
            "variants": [
                {"size": "A3", "sku": "ZP-001", "price": 0, "cost_price": 5.00},
            ],
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_variant_price_negative_rejected(self, client: AsyncClient, admin_headers, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "title": "Negative Price",
            "slug": "negative-price",
            "variants": [
                {"size": "A3", "sku": "NP-001", "price": -10.00, "cost_price": 5.00},
            ],
        }
        resp = await client.post("/api/v1/admin/products", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_fulfillment_export_csv_empty_order_ids_rejected(
        self, client: AsyncClient, admin_headers
    ):
        resp = await client.post(
            "/api/v1/admin/fulfillment/export-csv",
            json={"order_ids": []},
            headers=admin_headers,
        )
        assert resp.status_code == 422

    async def test_fulfillment_mark_sent_empty_order_ids_rejected(
        self, client: AsyncClient, admin_headers
    ):
        resp = await client.post(
            "/api/v1/admin/fulfillment/mark-sent",
            json={"order_ids": []},
            headers=admin_headers,
        )
        assert resp.status_code == 422

    async def test_order_items_required_nonempty(self, client: AsyncClient, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "shipping_address_line1": "123 Main St",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "DE",
            "items": [],  # empty items list
        }
        resp = await client.post("/api/v1/orders", json=payload)
        assert resp.status_code == 422

    async def test_order_customer_email_must_be_valid(self, client: AsyncClient, artist_factory):
        artist = await artist_factory()
        payload = {
            "artist_id": str(artist.id),
            "customer_email": "not-an-email",
            "customer_name": "Test User",
            "shipping_address_line1": "123 Main St",
            "shipping_city": "Berlin",
            "shipping_postal_code": "10115",
            "shipping_country": "DE",
            "items": [{"variant_id": str(uuid.uuid4()), "quantity": 1}],
        }
        resp = await client.post("/api/v1/orders", json=payload)
        assert resp.status_code == 422

    # -- Color validation --

    async def test_artist_primary_color_must_match_hex_pattern(
        self, client: AsyncClient, admin_headers
    ):
        payload = {
            "name": "Bad Color",
            "slug": "bad-color",
            "domain": "badcolor.example.com",
            "primary_color": "red",  # not a valid hex color
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422

    async def test_artist_color_rejects_short_hex(self, client: AsyncClient, admin_headers):
        payload = {
            "name": "Short Hex",
            "slug": "short-hex",
            "domain": "shorthex.example.com",
            "primary_color": "#FFF",  # 3-char hex, not 6
        }
        resp = await client.post("/api/v1/admin/artists", json=payload, headers=admin_headers)
        assert resp.status_code == 422
