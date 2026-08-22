"""create tenants and tenant_settings tables

Revision ID: 0008
Revises: 9718ab9c44c7
Create Date: 2026-08-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0008"
down_revision = "9718ab9c44c7"
branch_labels = None
depends_on = None

tenant_status_enum = postgresql.ENUM(
    "active", "trial", "suspended", "cancelled",
    name="tenant_status_enum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()

    # Enable pgcrypto for gen_random_uuid() – safe to run multiple times
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # Create tenant_status enum type
    tenant_status_enum.create(bind, checkfirst=True)

    # ------------------------------------------------------------------ #
    # tenants                                                              #
    # ------------------------------------------------------------------ #
    op.create_table(
        "tenants",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name",       sa.String(200), nullable=False),
        sa.Column("slug",       sa.String(100), nullable=False),
        sa.Column(
            "status",
            tenant_status_enum,
            nullable=False,
            server_default="active",
        ),
        sa.Column("plan_code",  sa.String(50),  nullable=False, server_default="BASIC"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("uq_tenants_slug", "tenants", ["slug"], unique=True)
    op.create_index("idx_tenants_status", "tenants", ["status"])

    # ------------------------------------------------------------------ #
    # tenant_settings                                                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "tenant_settings",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "tenant_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("app_name",          sa.String(150), nullable=False, server_default="DAMKAR Cloud"),
        sa.Column("app_short_name",    sa.String(50),  nullable=False, server_default="DAMKAR"),
        sa.Column("organization_name", sa.String(200), nullable=True),
        sa.Column("region_name",       sa.String(150), nullable=True),
        sa.Column("logo_url",          sa.String(500), nullable=True),
        sa.Column("primary_color",     sa.String(20),  nullable=False, server_default="#C62828"),
        sa.Column("secondary_color",   sa.String(20),  nullable=False, server_default="#1A1D23"),
        sa.Column("contact_email",     sa.String(150), nullable=True),
        sa.Column("contact_phone",     sa.String(50),  nullable=True),
        sa.Column("address",           sa.Text(),      nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "uq_tenant_settings_tenant",
        "tenant_settings",
        ["tenant_id"],
        unique=True,
    )
    op.create_index("idx_tenant_settings_tenant", "tenant_settings", ["tenant_id"])


def downgrade() -> None:
    op.drop_table("tenant_settings")
    op.drop_table("tenants")
    tenant_status_enum.drop(op.get_bind(), checkfirst=True)
