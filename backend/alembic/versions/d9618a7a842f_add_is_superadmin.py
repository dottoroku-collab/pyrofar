"""add is_superadmin

Revision ID: d9618a7a842f
Revises: d9618a7a842e
Create Date: 2026-08-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd9618a7a842f'
down_revision = 'd9618a7a842e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add the column with a default of False
    op.add_column('users', sa.Column('is_superadmin', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'is_superadmin')
