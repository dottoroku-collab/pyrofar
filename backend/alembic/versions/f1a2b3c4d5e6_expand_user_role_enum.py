"""expand user_role enum to 8 roles

Revision ID: f1a2b3c4d5e6
Revises: e0c1a268a7f0
Create Date: 2026-08-14 15:28:00.000000

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'e0c1a268a7f0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new enum values to user_role type
    # PostgreSQL requires ALTER TYPE ... ADD VALUE
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_cc'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_lapangan'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_sarpras'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operator_pencegahan'")

    op.execute("COMMIT")

    # Migrate existing 'operator' users to 'operator_cc' (command center) as default
    # This is a safe default — admin can reassign later
    op.execute("""
        UPDATE users SET role = 'operator_cc' WHERE role = 'operator'
    """)


def downgrade() -> None:
    # Migrate specialized operators back to generic 'operator'
    op.execute("""
        UPDATE users SET role = 'operator'
        WHERE role IN ('operator_cc', 'operator_lapangan', 'operator_sarpras', 'operator_pencegahan')
    """)
    # Note: PostgreSQL does not support removing enum values easily.
    # The old 'operator' value is still present in the type, so no ALTER TYPE needed for downgrade.
