"""No-op (superseded by 007).

Originally attempted to insert a Laz Lewis artist, but the artist already
existed on production under the same slug, so the INSERT would have failed
the unique constraint and broken the deploy. Migration 007 handles the
actual change (adding a hero_image_url column and pointing the existing
Laz Lewis row at the Starfish image).

Revision ID: 006
Revises: 005
"""

from alembic import op  # noqa: F401

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
