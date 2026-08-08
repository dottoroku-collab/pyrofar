"""initial: users, jenis_kendaraan, lokasi

Revision ID: 0001
Revises:
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

user_role_enum = sa.Enum(
    "administrator", "pimpinan", "kabid", "operator", "teknisi",
    name="user_role",
)


def upgrade() -> None:
    user_role_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("nama", sa.String(150), nullable=False),
        sa.Column("email", sa.String(150), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(
        "uq_users_email_active", "users", ["email"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.create_table(
        "jenis_kendaraan",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nama", sa.String(100), nullable=False),
        sa.Column("deskripsi", sa.Text(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(
        "uq_jenis_kendaraan_nama_active", "jenis_kendaraan", ["nama"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )

    op.create_table(
        "lokasi",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nama", sa.String(100), nullable=False),
        sa.Column("deskripsi", sa.Text(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index(
        "uq_lokasi_nama_active", "lokasi", ["nama"], unique=True,
        postgresql_where=sa.text("is_deleted = false"),
    )


def downgrade() -> None:
    op.drop_table("lokasi")
    op.drop_table("jenis_kendaraan")
    op.drop_table("users")
    user_role_enum.drop(op.get_bind(), checkfirst=True)
