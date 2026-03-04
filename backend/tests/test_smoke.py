"""Smoke test to verify test infrastructure works."""


async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


async def test_db_fixtures(artist_factory, product_factory, variant_factory):
    artist = await artist_factory()
    product = await product_factory(artist.id)
    variant = await variant_factory(product.id)
    assert artist.name.startswith("Test Artist")
    assert product.artist_id == artist.id
    assert variant.product_id == product.id
