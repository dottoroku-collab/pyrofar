"""split operator_lapangan role

Revision ID: ba4e4c804532
Revises: 5842594a1c6a
Create Date: 2026-08-14 15:59:38.283474

"""
from alembic import op
import sqlalchemy as sa


revision = 'ba4e4c804532'
down_revision = '5842594a1c6a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new enum values to user_role type
    # PostgreSQL requires ALTER TYPE ... ADD VALUE
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_lapangan_damkar'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_lapangan_penyelamatan'")

    op.execute("COMMIT")

    # Migrate existing 'operator_lapangan' users to 'operator_lapangan_damkar'
    op.execute("""
        UPDATE users SET role = 'operator_lapangan_damkar' WHERE role = 'operator_lapangan'
    """)


def downgrade() -> None:
    # Migrate back to generic 'operator_lapangan'
    op.execute("""
        UPDATE users SET role = 'operator_lapangan'
        WHERE role IN ('operator_lapangan_damkar', 'operator_lapangan_penyelamatan')
    """)
