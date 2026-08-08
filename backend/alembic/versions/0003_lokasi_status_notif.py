"""histori_lokasi, histori_status, notifikasi

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

# Reuse enum yang sudah dibuat di migrasi 0002 — create_type=False agar tidak dibuat ulang
status_armada_enum = sa.Enum(
    "standby", "sedang_bertugas", "pemeliharaan", "menunggu_sparepart",
    "rusak_ringan", "rusak_berat", "tidak_aktif", "menunggu_approval",
    name="status_armada_enum", create_type=False,
)
approval_status_enum = sa.Enum(
    "tidak_perlu", "pending", "disetujui", "ditolak",
    name="approval_status_enum", create_type=False,
)


def upgrade() -> None:
    op.create_table(
        "histori_lokasi",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=False),
        sa.Column("lokasi_lama_id", sa.Integer(), sa.ForeignKey("lokasi.id"), nullable=True),
        sa.Column("lokasi_baru_id", sa.Integer(), sa.ForeignKey("lokasi.id"), nullable=False),
        sa.Column("tanggal_pindah", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("dipindahkan_oleh", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("keterangan", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_histori_lokasi_armada", "histori_lokasi", ["armada_id", "tanggal_pindah"])

    op.create_table(
        "histori_status",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=False),
        sa.Column("status_lama", status_armada_enum, nullable=True),
        sa.Column("status_baru", status_armada_enum, nullable=False),
        sa.Column("tanggal", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("diajukan_oleh", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("butuh_approval", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("approval_status", approval_status_enum, nullable=False, server_default="tidak_perlu"),
        sa.Column("disetujui_oleh", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("tanggal_approval", sa.DateTime(timezone=True), nullable=True),
        sa.Column("catatan_approval", sa.Text(), nullable=True),
        sa.Column("keterangan", sa.Text(), nullable=True),
    )
    op.create_index("idx_histori_status_armada", "histori_status", ["armada_id", "tanggal"])
    op.create_index(
        "idx_histori_status_pending", "histori_status", ["approval_status"],
        postgresql_where=sa.text("approval_status = 'pending'"),
    )

    op.create_table(
        "notifikasi",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=True),
        sa.Column("jenis", sa.String(50), nullable=True),
        sa.Column("pesan", sa.String(500), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_notifikasi_user_unread", "notifikasi", ["user_id", "is_read"])


def downgrade() -> None:
    op.drop_table("notifikasi")
    op.drop_table("histori_status")
    op.drop_table("histori_lokasi")
