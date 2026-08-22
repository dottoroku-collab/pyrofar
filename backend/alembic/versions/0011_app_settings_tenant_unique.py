"""add unique constraint on app_settings per tenant

Revision ID: 0011
Revises: 0010
Create Date: 2026-08-10

"""
from alembic import op
import sqlalchemy as sa

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # One app_settings row per tenant (legacy table; tenant_settings is
    # the canonical source from Phase 1 onward, but app_settings is kept
    # for backward compatibility and will be deprecated in Phase 3.)
    op.create_index(
        "uq_app_settings_tenant",
        "app_settings",
        ["tenant_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_app_settings_tenant", table_name="app_settings")
