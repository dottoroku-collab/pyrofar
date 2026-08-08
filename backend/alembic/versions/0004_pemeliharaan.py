"""pemeliharaan, sparepart, jadwal_servis

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-07

"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

status_pemeliharaan_enum = sa.Enum("proses", "selesai", name="status_pemeliharaan_enum")
jenis_reminder_enum = sa.Enum(
    "servis_berkala", "ganti_oli", "ganti_ban", "perpanjangan_stnk",
    name="jenis_reminder_enum",
)


def upgrade() -> None:
    bind = op.get_bind()
    status_pemeliharaan_enum.create(bind, checkfirst=True)
    jenis_reminder_enum.create(bind, checkfirst=True)

    op.create_table(
        "pemeliharaan",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=False),
        sa.Column("tanggal", sa.Date(), nullable=False),
        sa.Column("jenis_kendala", sa.String(150), nullable=True),
        sa.Column("kategori", sa.String(100), nullable=True),
        sa.Column("jenis_pekerjaan", sa.String(150), nullable=True),
        sa.Column("nama_montir", sa.String(150), nullable=True),
        sa.Column("vendor", sa.String(150), nullable=True),
        sa.Column("biaya", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("jumlah", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("foto_sebelum_url", sa.String(500), nullable=True),
        sa.Column("foto_sesudah_url", sa.String(500), nullable=True),
        sa.Column("status", status_pemeliharaan_enum, nullable=False, server_default="proses"),
        sa.Column("keterangan", sa.Text(), nullable=True),
        sa.Column("input_oleh", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("tanggal_input", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index(
        "idx_pemeliharaan_armada", "pemeliharaan", ["armada_id", "tanggal"],
        postgresql_where=sa.text("is_deleted = false"),
    )
    op.create_index(
        "idx_pemeliharaan_status", "pemeliharaan", ["status"],
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.create_table(
        "sparepart",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("pemeliharaan_id", sa.BigInteger(), sa.ForeignKey("pemeliharaan.id"), nullable=False),
        sa.Column("nama_sparepart", sa.String(150), nullable=False),
        sa.Column("merk", sa.String(100), nullable=True),
        sa.Column("jumlah", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("harga", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("tanggal_penggantian", sa.Date(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index(
        "idx_sparepart_pemeliharaan", "sparepart", ["pemeliharaan_id"],
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.create_table(
        "jadwal_servis",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("armada_id", sa.BigInteger(), sa.ForeignKey("armada.id"), nullable=False),
        sa.Column("jenis_reminder", jenis_reminder_enum, nullable=False),
        sa.Column("tanggal_jatuh_tempo", sa.Date(), nullable=False),
        sa.Column("ambang_hari_reminder", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("status", sa.String(30), nullable=False, server_default="aktif"),
    )
    op.create_index("idx_jadwal_servis_due", "jadwal_servis", ["tanggal_jatuh_tempo", "status"])
    op.create_index("idx_jadwal_servis_armada", "jadwal_servis", ["armada_id"])


def downgrade() -> None:
    op.drop_table("jadwal_servis")
    op.drop_table("sparepart")
    op.drop_table("pemeliharaan")
    jenis_reminder_enum.drop(op.get_bind(), checkfirst=True)
    status_pemeliharaan_enum.drop(op.get_bind(), checkfirst=True)
