"""audit_log

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

audit_aksi_enum = sa.Enum(
    "login", "tambah", "edit", "hapus", "pindah_lokasi", "input_maintenance", "approve", "reject",
    name="audit_aksi_enum",
)


def upgrade() -> None:
    audit_aksi_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("aksi", audit_aksi_enum, nullable=False),
        sa.Column("entitas", sa.String(100), nullable=False),
        sa.Column("entitas_id", sa.BigInteger(), nullable=True),
        sa.Column("nilai_sebelum", postgresql.JSONB(), nullable=True),
        sa.Column("nilai_sesudah", postgresql.JSONB(), nullable=True),
        sa.Column("waktu", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_audit_log_user", "audit_log", ["user_id"])
    op.create_index("idx_audit_log_entity", "audit_log", ["entitas", "entitas_id"])
    op.create_index("idx_audit_log_waktu", "audit_log", ["waktu"])


def downgrade() -> None:
    op.drop_table("audit_log")
    audit_aksi_enum.drop(op.get_bind(), checkfirst=True)
