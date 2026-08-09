"""increase license key length

Revision ID: 9718ab9c44c7
Revises: 0007
Create Date: 2026-08-09

"""

from alembic import op
import sqlalchemy as sa


revision = "9718ab9c44c7"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "licenses",
        "license_key",
        existing_type=sa.String(length=255),
        type_=sa.String(length=2048),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "licenses",
        "license_key",
        existing_type=sa.String(length=2048),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
