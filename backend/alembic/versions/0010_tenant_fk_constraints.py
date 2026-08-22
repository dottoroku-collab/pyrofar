"""add FK constraints, NOT NULL, indexes, and update tenant-scoped unique indexes

Revision ID: 0010
Revises: 0009
Create Date: 2026-08-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None

# Tables that get NOT NULL + FK constraint (order matters for FK)
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

# Performance indexes to create: (index_name, table, columns)
TENANT_INDEXES = [
    ("idx_users_tenant",           "users",           ["tenant_id"]),
    ("idx_armada_tenant",          "armada",          ["tenant_id"]),
    ("idx_armada_file_tenant",     "armada_file",     ["tenant_id"]),
    ("idx_lokasi_tenant",          "lokasi",          ["tenant_id"]),
    ("idx_jenis_kend_tenant",      "jenis_kendaraan", ["tenant_id"]),
    ("idx_histori_lok_tenant",     "histori_lokasi",  ["tenant_id"]),
    ("idx_histori_sts_tenant",     "histori_status",  ["tenant_id"]),
    ("idx_notifikasi_tenant",      "notifikasi",      ["tenant_id"]),
    ("idx_pemeliharaan_tenant",    "pemeliharaan",    ["tenant_id"]),
    ("idx_sparepart_tenant",       "sparepart",       ["tenant_id"]),
    ("idx_jadwal_tenant",          "jadwal_servis",   ["tenant_id"]),
    ("idx_audit_tenant",           "audit_log",       ["tenant_id"]),
    ("idx_app_settings_tenant",    "app_settings",    ["tenant_id"]),
    ("idx_licenses_tenant",        "licenses",        ["tenant_id"]),
]


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. Set NOT NULL on tenant_id for all tables                         #
    # ------------------------------------------------------------------ #
    for table in TENANT_TABLES:
        op.alter_column(
            table,
            "tenant_id",
            existing_type=postgresql.UUID(as_uuid=True),
            nullable=False,
        )

    # ------------------------------------------------------------------ #
    # 2. Add FK constraints (pointing to tenants.id)                      #
    # ------------------------------------------------------------------ #
    for table in TENANT_TABLES:
        op.create_foreign_key(
            f"fk_{table}_tenant",
            table,
            "tenants",
            ["tenant_id"],
            ["id"],
        )

    # ------------------------------------------------------------------ #
    # 3. Performance indexes on tenant_id                                 #
    # ------------------------------------------------------------------ #
    for idx_name, table, cols in TENANT_INDEXES:
        op.create_index(idx_name, table, cols)

    # ------------------------------------------------------------------ #
    # 4. Update armada uniqueness: global → per-tenant                    #
    # ------------------------------------------------------------------ #
    # Drop old deployment-wide partial unique indexes
    op.drop_index("uq_armada_kode_active",     table_name="armada")
    op.drop_index("uq_armada_no_polisi_active", table_name="armada")
    op.drop_index("uq_armada_no_lambung_active", table_name="armada")
    op.drop_index("uq_armada_qr_active",        table_name="armada")

    # Recreate as tenant-scoped partial unique indexes
    op.create_index(
        "uq_armada_kode_tenant",
        "armada",
        ["tenant_id", "kode_armada"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index(
        "uq_armada_no_polisi_tenant",
        "armada",
        ["tenant_id", "no_polisi"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_polisi IS NOT NULL"),
    )
    op.create_index(
        "uq_armada_no_lambung_tenant",
        "armada",
        ["tenant_id", "no_lambung"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_lambung IS NOT NULL"),
    )
    op.create_index(
        "uq_armada_qr_tenant",
        "armada",
        ["tenant_id", "qr_code_value"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    # ------------------------------------------------------------------ #
    # 5. Update users email uniqueness: global → per-tenant               #
    # ------------------------------------------------------------------ #
    # Drop old global unique index (created in 0001_initial.py as
    # "uq_users_email_active" — verify name from initial migration)
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE indexname = 'uq_users_email_active'
            ) THEN
                DROP INDEX uq_users_email_active;
            END IF;
        END$$
    """)

    op.create_index(
        "uq_users_email_tenant",
        "users",
        ["tenant_id", "email"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    # ------------------------------------------------------------------ #
    # 6. Update jenis_kendaraan + lokasi uniqueness: per-tenant           #
    # ------------------------------------------------------------------ #
    # Drop old global unique indexes
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_jenis_kendaraan_nama_active') THEN
                DROP INDEX uq_jenis_kendaraan_nama_active;
            END IF;
        END$$
    """)
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_lokasi_nama_active') THEN
                DROP INDEX uq_lokasi_nama_active;
            END IF;
        END$$
    """)

    op.create_index(
        "uq_jenis_kendaraan_nama_tenant",
        "jenis_kendaraan",
        ["tenant_id", "nama"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index(
        "uq_lokasi_nama_tenant",
        "lokasi",
        ["tenant_id", "nama"],
        unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )


def downgrade() -> None:
    # Restore original unique indexes
    op.drop_index("uq_lokasi_nama_tenant",        table_name="lokasi")
    op.drop_index("uq_jenis_kendaraan_nama_tenant", table_name="jenis_kendaraan")
    op.create_index(
        "uq_jenis_kendaraan_nama_active", "jenis_kendaraan", ["nama"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index(
        "uq_lokasi_nama_active", "lokasi", ["nama"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.drop_index("uq_users_email_tenant",        table_name="users")
    op.create_index(
        "uq_users_email_active", "users", ["email"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.drop_index("uq_armada_qr_tenant",          table_name="armada")
    op.drop_index("uq_armada_no_lambung_tenant",   table_name="armada")
    op.drop_index("uq_armada_no_polisi_tenant",    table_name="armada")
    op.drop_index("uq_armada_kode_tenant",         table_name="armada")

    op.create_index("uq_armada_qr_active",         "armada", ["qr_code_value"], unique=True,
        postgresql_where=sa.text("is_deleted = false"))
    op.create_index("uq_armada_no_lambung_active",  "armada", ["no_lambung"], unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_lambung IS NOT NULL"))
    op.create_index("uq_armada_no_polisi_active",   "armada", ["no_polisi"], unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_polisi IS NOT NULL"))
    op.create_index("uq_armada_kode_active",        "armada", ["kode_armada"], unique=True,
        postgresql_where=sa.text("is_deleted = false"))

    # Drop performance indexes
    for idx_name, table, _ in reversed(TENANT_INDEXES):
        op.drop_index(idx_name, table_name=table)

    # Drop FK constraints
    for table in reversed(TENANT_TABLES):
        op.drop_constraint(f"fk_{table}_tenant", table, type_="foreignkey")

    # Revert tenant_id to nullable
    for table in reversed(TENANT_TABLES):
        op.alter_column(
            table,
            "tenant_id",
            existing_type=postgresql.UUID(as_uuid=True),
            nullable=True,
        )
