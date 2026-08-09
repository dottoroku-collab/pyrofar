"""add licenses

Revision ID: 0007
Revises: 0006
Create Date: 2026-08-08
"""

from alembic import op
import sqlalchemy as sa


revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "licenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "license_key",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "license_id",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "plan_code",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "plan_name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "organization_name",
            sa.String(length=255),
            nullable=True,
        ),
        sa.Column(
            "issued_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "max_users",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "max_armada",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "features",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "activated_at",
            sa.DateTime(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("license_key"),
        sa.UniqueConstraint("license_id"),
    )

    op.create_index(
        "ix_licenses_id",
        "licenses",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_licenses_license_key",
        "licenses",
        ["license_key"],
        unique=True,
    )

    op.create_index(
        "ix_licenses_license_id",
        "licenses",
        ["license_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_licenses_license_id",
        table_name="licenses",
    )

    op.drop_index(
        "ix_licenses_license_key",
        table_name="licenses",
    )

    op.drop_index(
        "ix_licenses_id",
        table_name="licenses",
    )

    op.drop_table("licenses")
