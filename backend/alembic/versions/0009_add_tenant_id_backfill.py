"""seed Makassar tenant + add tenant_id to all existing tables

Revision ID: 0009
Revises: 0008
Create Date: 2026-08-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None

# Fixed UUID for the seed Damkar Kota Makassar tenant
# Using a deterministic UUID so migrations are idempotent
MAKASSAR_TENANT_ID = "00000000-0000-0000-0000-000000000001"

# Tables that get tenant_id, in dependency order
TENANT_TABLES = [
    "users",
    "lokasi",
    "jenis_kendaraan",
    "armada",
    "armada_file",
    "histori_lokasi",
    "histori_status",
    "notifikasi",
    "pemeliharaan",
    "sparepart",
    "jadwal_servis",
    "audit_log",
    "app_settings",
    "licenses",
]


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. Seed the Makassar tenant                                         #
    # ------------------------------------------------------------------ #
    op.execute(f"""
        INSERT INTO tenants (id, name, slug, status, plan_code)
        VALUES (
            '{MAKASSAR_TENANT_ID}',
            'Damkar Kota Makassar',
            'damkar-makassar',
            'active',
            'ENTERPRISE'
        )
        ON CONFLICT (id) DO NOTHING
    """)

    # ------------------------------------------------------------------ #
    # 2. Copy existing app_settings row into tenant_settings              #
    # ------------------------------------------------------------------ #
    op.execute(f"""
        INSERT INTO tenant_settings (
            tenant_id, app_name, app_short_name,
            organization_name, region_name, logo_url,
            primary_color, secondary_color,
            contact_email, contact_phone, address
        )
        SELECT
            '{MAKASSAR_TENANT_ID}',
            COALESCE(app_name, 'SIM Armada Damkar'),
            COALESCE(app_short_name, 'SIM Armada'),
            organization_name,
            region_name,
            logo_url,
            COALESCE(primary_color, '#C62828'),
            COALESCE(secondary_color, '#263238'),
            contact_email,
            contact_phone,
            address
        FROM app_settings
        WHERE id = 1
        ON CONFLICT (tenant_id) DO NOTHING
    """)

    # ------------------------------------------------------------------ #
    # 3. Add audit_log enhancements (ip_address, user_agent)              #
    # ------------------------------------------------------------------ #
    op.add_column(
        "audit_log",
        sa.Column("ip_address", sa.String(45), nullable=True),
    )
    op.add_column(
        "audit_log",
        sa.Column("user_agent", sa.String(500), nullable=True),
    )

    # ------------------------------------------------------------------ #
    # 4. Add tenant_id UUID column (nullable first) to every table        #
    # ------------------------------------------------------------------ #
    for table in TENANT_TABLES:
        op.add_column(
            table,
            sa.Column(
                "tenant_id",
                postgresql.UUID(as_uuid=True),
                nullable=True,
            ),
        )

    # ------------------------------------------------------------------ #
    # 5. Backfill all existing rows to Makassar tenant                    #
    # ------------------------------------------------------------------ #
    for table in TENANT_TABLES:
        op.execute(f"""
            UPDATE {table}
            SET tenant_id = '{MAKASSAR_TENANT_ID}'
            WHERE tenant_id IS NULL
        """)


def downgrade() -> None:
    # Remove tenant_id columns in reverse order
    for table in reversed(TENANT_TABLES):
        op.drop_column(table, "tenant_id")

    # Remove audit_log additions
    op.drop_column("audit_log", "user_agent")
    op.drop_column("audit_log", "ip_address")

    # Remove seed data
    op.execute(f"""
        DELETE FROM tenant_settings
        WHERE tenant_id = '{MAKASSAR_TENANT_ID}'
    """)
    op.execute(f"""
        DELETE FROM tenants
        WHERE id = '{MAKASSAR_TENANT_ID}'
    """)
