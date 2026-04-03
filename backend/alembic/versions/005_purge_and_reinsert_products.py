"""Purge all test data and reinsert clean products with proper SKUs and pricing.

Revision ID: 005
Revises: 004
"""

from alembic import op

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None

ARTIST_ID = "28c87ab5-2465-433e-9605-fc06f791d616"  # MadeByGray on Railway


def upgrade() -> None:
    # Purge all existing data (order items → orders → transactions → variants → products)
    op.execute("DELETE FROM order_items;")
    op.execute("DELETE FROM transactions;")
    op.execute("DELETE FROM orders;")
    op.execute("DELETE FROM product_variants;")
    op.execute("DELETE FROM products;")

    # Reinsert clean products (keeping existing S3 image URLs)
    op.execute(f"""
        INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
        ('b0000001-0000-0000-0000-000000000001', '{ARTIST_ID}', 'AT Vetements', 'at-vetements',
         'Haute couture meets raw street energy. Inspired by Vetements'' deconstructed approach to fashion, reimagined through bold graphic design.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/unknown/1773343973376-AT_Vetement_-_2x3.jpg', true),

        ('b0000002-0000-0000-0000-000000000002', '{ARTIST_ID}', 'BAPE x KidSuper', 'bape-x-kidsuper',
         'Two streetwear giants collide. A graphic tribute to the BAPE and KidSuper collaboration — camo patterns, painterly strokes, and pure creative chaos.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/unknown/1773346497895-Bape_x_KidSuper_-_A4.jpg', true),

        ('b0000003-0000-0000-0000-000000000003', '{ARTIST_ID}', 'Jordan Barrett', 'jordan-barrett',
         'Australian supermodel Jordan Barrett in a moody, editorial-style composition. Sharp contrasts and cinematic lighting define this portrait piece.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/unknown/1773346577935-Jordan_Barrett_-_2x3.jpg', true),

        ('b0000004-0000-0000-0000-000000000004', '{ARTIST_ID}', 'Sp5der Country', 'sp5der-country',
         'Sp5der''s unmistakable web-draped aesthetic meets southern grit. Bold typography and heavy textures capture the brand''s rebellious spirit.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/unknown/1773346964339-Sp5der_Cuntry_-_A4_copy.jpg', true),

        ('b0000005-0000-0000-0000-000000000005', '{ARTIST_ID}', 'Dominic Fike — Sunburn', 'dominic-fike-sunburn',
         'Dominic Fike''s Sunburn era distilled into warm, golden tones. A hazy, sun-drenched portrait that captures the feeling of the music.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/madebygray/1773347217173-sunburn_dominic_fike_-_A4_copy.jpg', true),

        ('b0000006-0000-0000-0000-000000000006', '{ARTIST_ID}', 'Travis Scott', 'travis-scott',
         'La Flame in his element. A high-energy poster capturing the raw intensity and larger-than-life stage presence of Travis Scott.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/madebygray/1773342756687-Travis_Scott_-_2x3_copy.jpg', true),

        ('b0000007-0000-0000-0000-000000000007', '{ARTIST_ID}', 'Yohji Yamamoto AW98', 'yohji-yamamoto-aw98',
         'A tribute to Yohji Yamamoto''s iconic Autumn/Winter 1998 collection. Dark, poetic, and timeless — the essence of avant-garde fashion.',
         'https://ginkoposters-print-files.s3.eu-central-1.amazonaws.com/posters/madebygray/1773347703148-yohji_yamamoto_aw1998_-_A4_copy.jpg', true);
    """)

    # Insert variants: A4 / A3 / A2 for each product with proper SKUs
    # Standard tier: $24.99 / $34.99 / $49.99
    # Premium tier (Travis Scott, Yohji): $29.99 / $39.99 / $54.99
    op.execute("""
        INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
        -- AT Vetements
        (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001', 'A4', 'MBG-ATV-A4', 24.99, 6.00),
        (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001', 'A3', 'MBG-ATV-A3', 34.99, 9.00),
        (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001', 'A2', 'MBG-ATV-A2', 49.99, 14.00),
        -- BAPE x KidSuper
        (gen_random_uuid(), 'b0000002-0000-0000-0000-000000000002', 'A4', 'MBG-BKS-A4', 24.99, 6.00),
        (gen_random_uuid(), 'b0000002-0000-0000-0000-000000000002', 'A3', 'MBG-BKS-A3', 34.99, 9.00),
        (gen_random_uuid(), 'b0000002-0000-0000-0000-000000000002', 'A2', 'MBG-BKS-A2', 49.99, 14.00),
        -- Jordan Barrett
        (gen_random_uuid(), 'b0000003-0000-0000-0000-000000000003', 'A4', 'MBG-JBT-A4', 24.99, 6.00),
        (gen_random_uuid(), 'b0000003-0000-0000-0000-000000000003', 'A3', 'MBG-JBT-A3', 34.99, 9.00),
        (gen_random_uuid(), 'b0000003-0000-0000-0000-000000000003', 'A2', 'MBG-JBT-A2', 49.99, 14.00),
        -- Sp5der Country
        (gen_random_uuid(), 'b0000004-0000-0000-0000-000000000004', 'A4', 'MBG-SP5-A4', 24.99, 6.00),
        (gen_random_uuid(), 'b0000004-0000-0000-0000-000000000004', 'A3', 'MBG-SP5-A3', 34.99, 9.00),
        (gen_random_uuid(), 'b0000004-0000-0000-0000-000000000004', 'A2', 'MBG-SP5-A2', 49.99, 14.00),
        -- Dominic Fike — Sunburn
        (gen_random_uuid(), 'b0000005-0000-0000-0000-000000000005', 'A4', 'MBG-DFS-A4', 24.99, 6.00),
        (gen_random_uuid(), 'b0000005-0000-0000-0000-000000000005', 'A3', 'MBG-DFS-A3', 34.99, 9.00),
        (gen_random_uuid(), 'b0000005-0000-0000-0000-000000000005', 'A2', 'MBG-DFS-A2', 49.99, 14.00),
        -- Travis Scott (premium)
        (gen_random_uuid(), 'b0000006-0000-0000-0000-000000000006', 'A4', 'MBG-TSC-A4', 29.99, 6.00),
        (gen_random_uuid(), 'b0000006-0000-0000-0000-000000000006', 'A3', 'MBG-TSC-A3', 39.99, 9.00),
        (gen_random_uuid(), 'b0000006-0000-0000-0000-000000000006', 'A2', 'MBG-TSC-A2', 54.99, 14.00),
        -- Yohji Yamamoto AW98 (premium)
        (gen_random_uuid(), 'b0000007-0000-0000-0000-000000000007', 'A4', 'MBG-YYA-A4', 29.99, 6.00),
        (gen_random_uuid(), 'b0000007-0000-0000-0000-000000000007', 'A3', 'MBG-YYA-A3', 39.99, 9.00),
        (gen_random_uuid(), 'b0000007-0000-0000-0000-000000000007', 'A2', 'MBG-YYA-A2', 54.99, 14.00);
    """)


def downgrade() -> None:
    # Can't meaningfully restore the random test data — just clear
    op.execute("DELETE FROM product_variants;")
    op.execute("DELETE FROM products;")
