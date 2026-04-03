"""Update product titles, slugs, descriptions, and prices.

Revision ID: 004
Revises: 003
"""

from alembic import op

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update product titles, slugs, and descriptions
    op.execute("""
        UPDATE products SET
            title = 'AT Vetements',
            slug = 'at-vetements',
            description = 'Haute couture meets raw street energy. Inspired by Vetements'' deconstructed approach to fashion, reimagined through bold graphic design.'
        WHERE id = 'b3000001-0000-0000-0000-000000000001';
    """)
    op.execute("""
        UPDATE products SET
            title = 'BAPE x KidSuper',
            description = 'Two streetwear giants collide. A graphic tribute to the BAPE and KidSuper collaboration — camo patterns, painterly strokes, and pure creative chaos.'
        WHERE id = 'b3000002-0000-0000-0000-000000000002';
    """)
    op.execute("""
        UPDATE products SET
            description = 'Australian supermodel Jordan Barrett in a moody, editorial-style composition. Sharp contrasts and cinematic lighting define this portrait piece.'
        WHERE id = 'b3000003-0000-0000-0000-000000000003';
    """)
    op.execute("""
        UPDATE products SET
            title = 'Sp5der Country',
            slug = 'sp5der-country',
            description = 'Sp5der''s unmistakable web-draped aesthetic meets southern grit. Bold typography and heavy textures capture the brand''s rebellious spirit.'
        WHERE id = 'b3000004-0000-0000-0000-000000000004';
    """)
    op.execute("""
        UPDATE products SET
            title = 'Dominic Fike — Sunburn',
            slug = 'dominic-fike-sunburn',
            description = 'Dominic Fike''s Sunburn era distilled into warm, golden tones. A hazy, sun-drenched portrait that captures the feeling of the music.'
        WHERE id = 'b3000005-0000-0000-0000-000000000005';
    """)
    op.execute("""
        UPDATE products SET
            description = 'La Flame in his element. A high-energy poster capturing the raw intensity and larger-than-life stage presence of Travis Scott.'
        WHERE id = 'b3000006-0000-0000-0000-000000000006';
    """)
    op.execute("""
        UPDATE products SET
            title = 'Yohji Yamamoto AW98',
            slug = 'yohji-yamamoto-aw98',
            description = 'A tribute to Yohji Yamamoto''s iconic Autumn/Winter 1998 collection. Dark, poetic, and timeless — the essence of avant-garde fashion.'
        WHERE id = 'b3000007-0000-0000-0000-000000000007';
    """)

    # Update prices — standard tier: $24.99 / $34.99 / $49.99
    op.execute("""
        UPDATE product_variants SET price = 24.99
        WHERE product_id IN (
            'b3000001-0000-0000-0000-000000000001',
            'b3000002-0000-0000-0000-000000000002',
            'b3000003-0000-0000-0000-000000000003',
            'b3000004-0000-0000-0000-000000000004',
            'b3000005-0000-0000-0000-000000000005'
        ) AND size = 'A4';
    """)
    op.execute("""
        UPDATE product_variants SET price = 34.99
        WHERE product_id IN (
            'b3000001-0000-0000-0000-000000000001',
            'b3000002-0000-0000-0000-000000000002',
            'b3000003-0000-0000-0000-000000000003',
            'b3000004-0000-0000-0000-000000000004',
            'b3000005-0000-0000-0000-000000000005'
        ) AND size = 'A3';
    """)
    op.execute("""
        UPDATE product_variants SET price = 49.99
        WHERE product_id IN (
            'b3000001-0000-0000-0000-000000000001',
            'b3000002-0000-0000-0000-000000000002',
            'b3000003-0000-0000-0000-000000000003',
            'b3000004-0000-0000-0000-000000000004',
            'b3000005-0000-0000-0000-000000000005'
        ) AND size = 'A2';
    """)

    # Update prices — premium tier (Travis Scott, Yohji): $29.99 / $39.99 / $54.99
    op.execute("""
        UPDATE product_variants SET price = 29.99
        WHERE product_id IN (
            'b3000006-0000-0000-0000-000000000006',
            'b3000007-0000-0000-0000-000000000007'
        ) AND size = 'A4';
    """)
    op.execute("""
        UPDATE product_variants SET price = 39.99
        WHERE product_id IN (
            'b3000006-0000-0000-0000-000000000006',
            'b3000007-0000-0000-0000-000000000007'
        ) AND size = 'A3';
    """)
    op.execute("""
        UPDATE product_variants SET price = 54.99
        WHERE product_id IN (
            'b3000006-0000-0000-0000-000000000006',
            'b3000007-0000-0000-0000-000000000007'
        ) AND size = 'A2';
    """)


def downgrade() -> None:
    # Revert product details to original values
    op.execute("""
        UPDATE products SET title = 'AT Vetement', slug = 'at-vetement',
            description = 'A striking fashion-forward poster blending haute couture with raw street energy.'
        WHERE id = 'b3000001-0000-0000-0000-000000000001';
    """)
    op.execute("""
        UPDATE products SET title = 'Bape x KidSuper',
            description = 'A bold collision of two iconic streetwear worlds — Bape meets KidSuper in vivid detail.'
        WHERE id = 'b3000002-0000-0000-0000-000000000002';
    """)
    op.execute("""
        UPDATE products SET
            description = 'Supermodel Jordan Barrett captured in a moody, editorial-style poster design.'
        WHERE id = 'b3000003-0000-0000-0000-000000000003';
    """)
    op.execute("""
        UPDATE products SET title = 'Sp5der Cuntry', slug = 'sp5der-cuntry',
            description = 'Sp5der''s signature aesthetic distilled into a bold, eye-catching poster piece.'
        WHERE id = 'b3000004-0000-0000-0000-000000000004';
    """)
    op.execute("""
        UPDATE products SET title = 'Sunburn Dominic Fike', slug = 'sunburn-dominic-fike',
            description = 'Dominic Fike''s sun-soaked Sunburn era captured in warm tones and expressive composition.'
        WHERE id = 'b3000005-0000-0000-0000-000000000005';
    """)
    op.execute("""
        UPDATE products SET
            description = 'The raw intensity and larger-than-life presence of Travis Scott brought to poster form.'
        WHERE id = 'b3000006-0000-0000-0000-000000000006';
    """)
    op.execute("""
        UPDATE products SET title = 'Yohji Yamamoto AW1998', slug = 'yohji-yamamoto-aw1998',
            description = 'A tribute to Yohji Yamamoto''s legendary Autumn/Winter 1998 collection — dark, poetic, timeless.'
        WHERE id = 'b3000007-0000-0000-0000-000000000007';
    """)

    # Revert all prices to $19.99 / $29.99 / $44.99
    op.execute("UPDATE product_variants SET price = 19.99 WHERE size = 'A4';")
    op.execute("UPDATE product_variants SET price = 29.99 WHERE size = 'A3';")
    op.execute("UPDATE product_variants SET price = 44.99 WHERE size = 'A2';")
