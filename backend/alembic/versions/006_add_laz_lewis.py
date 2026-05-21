"""Add Laz Lewis artist with Starfish poster and A4/A3/A2 variants.

Revision ID: 006
Revises: 005
"""

from alembic import op

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None

ARTIST_ID = "c0000001-0000-0000-0000-000000000001"
PRODUCT_ID = "b0000008-0000-0000-0000-000000000008"


def upgrade() -> None:
    op.execute(f"""
        INSERT INTO artists (id, name, slug, domain, primary_color, secondary_color, bio, is_active) VALUES
        ('{ARTIST_ID}', 'Laz Lewis', 'laz-lewis', 'lazlewis.local', '#0E4B6E', '#E8D5B7',
         'Coastal photography from quiet shores and slow afternoons. Laz Lewis frames the ocean, sun, and stillness in honest, light-drenched portraits of travel.',
         true);
    """)

    op.execute(f"""
        INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
        ('{PRODUCT_ID}', '{ARTIST_ID}', 'Starfish', 'starfish',
         'A sunlit moment on the rocks — snorkel mask up, starfish in hand. Mediterranean blues and warm skin tones frame a slow coastal afternoon.',
         '/images/laz-lewis/starfish.jpg', true);
    """)

    op.execute(f"""
        INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
        (gen_random_uuid(), '{PRODUCT_ID}', 'A4', 'LLW-STF-A4', 24.99, 6.00),
        (gen_random_uuid(), '{PRODUCT_ID}', 'A3', 'LLW-STF-A3', 34.99, 9.00),
        (gen_random_uuid(), '{PRODUCT_ID}', 'A2', 'LLW-STF-A2', 49.99, 14.00);
    """)


def downgrade() -> None:
    op.execute(f"DELETE FROM product_variants WHERE product_id = '{PRODUCT_ID}';")
    op.execute(f"DELETE FROM products WHERE id = '{PRODUCT_ID}';")
    op.execute(f"DELETE FROM artists WHERE id = '{ARTIST_ID}';")
