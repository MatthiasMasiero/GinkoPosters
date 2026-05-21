"""Add artists.hero_image_url column and set the Starfish image for Laz Lewis.

Revision ID: 007
Revises: 006
"""

from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "artists",
        sa.Column("hero_image_url", sa.String(length=500), nullable=True),
    )
    op.execute(
        "UPDATE artists SET hero_image_url = '/images/laz-lewis/starfish.jpg' "
        "WHERE slug = 'laz-lewis';"
    )


def downgrade() -> None:
    op.drop_column("artists", "hero_image_url")
