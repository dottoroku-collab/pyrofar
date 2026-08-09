"""armada & armada_file

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

status_armada_enum = postgresql.ENUM(
    "standby", "sedang_bertugas", "pemeliharaan", "menunggu_sparepart",
    "rusak_ringan", "rusak_berat", "tidak_aktif", "menunggu_approval",
    name="status_armada_enum",
)
approval_status_enum = postgresql.ENUM(
    "tidak_perlu", "pending", "disetujui", "ditolak",
    name="approval_status_enum",
)
jenis_file_armada_enum = postgresql.ENUM(
    "stnk", "bpkb", "foto_depan", "foto_belakang", "foto_kanan", "foto_kiri", "foto_interior",
    name="jenis_file_armada_enum",
)


def upgrade() -> None:
    op.create_table(
        "armada",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("kode_armada", sa.String(50), nullable=False),
        sa.Column("nama_armada", sa.String(150), nullable=True),
        sa.Column("jenis_kendaraan_id", sa.Integer(), sa.ForeignKey("jenis_kendaraan.id"), nullable=False),
        sa.Column("merk", sa.String(100), nullable=True),
        sa.Column("type", sa.String(100), nullable=True),
        sa.Column("tahun", sa.SmallInteger(), nullable=True),
        sa.Column("no_polisi", sa.String(20), nullable=True),
        sa.Column("no_lambung", sa.String(50), nullable=True),
        sa.Column("no_mesin", sa.String(100), nullable=True),
        sa.Column("no_rangka", sa.String(100), nullable=True),
        sa.Column("no_bpkb", sa.String(100), nullable=True),
        sa.Column("tanggal_stnk", sa.Date(), nullable=True),
        sa.Column("kapasitas", sa.String(50), nullable=True),
        sa.Column("status_kepemilikan", sa.String(100), nullable=True),
        sa.Column("qr_code_value", sa.String(100), nullable=False),
        sa.Column("status_armada", status_armada_enum, nullable=False, server_default="standby"),
        sa.Column("status_approval", approval_status_enum, nullable=False, server_default="tidak_perlu"),
        sa.Column("lokasi_saat_ini_id", sa.Integer(), sa.ForeignKey("lokasi.id"), nullable=True),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index(
        "uq_armada_kode_active", "armada", ["kode_armada"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index(
        "uq_armada_no_polisi_active", "armada", ["no_polisi"], unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_polisi IS NOT NULL"),
    )
    op.create_index(
        "uq_armada_no_lambung_active", "armada", ["no_lambung"], unique=True,
        postgresql_where=sa.text("is_deleted = false AND no_lambung IS NOT NULL"),
    )
    op.create_index(
        "uq_armada_qr_active", "armada", ["qr_code_value"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index("idx_armada_jenis", "armada", ["jenis_kendaraan_id"])
    op.create_index("idx_armada_lokasi", "armada", ["lokasi_saat_ini_id"])

    op.create_table(
        "armada_file",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=False),
        sa.Column("jenis_file", jenis_file_armada_enum, nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("uploaded_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_armada_file_armada", "armada_file", ["armada_id"])


def downgrade() -> None:
    op.drop_table("armada_file")
    op.drop_table("armada")
    jenis_file_armada_enum.drop(op.get_bind(), checkfirst=True)
    approval_status_enum.drop(op.get_bind(), checkfirst=True)
    status_armada_enum.drop(op.get_bind(), checkfirst=True)
