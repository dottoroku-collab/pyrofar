"""update_app_name_to_pyrofar

Revision ID: 240d4ff313e1
Revises: ba4e4c804532
Create Date: 2026-08-14 11:28:18.655725

"""
from alembic import op
import sqlalchemy as sa


revision = '240d4ff313e1'
down_revision = 'ba4e4c804532'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update tenant_settings with new PYROFAR app name
    op.execute(
        """
        UPDATE tenant_settings 
        SET 
            app_name = 'PYROFAR - Integrated Fire & Rescue Operations Platform',
            app_short_name = 'PYROFAR'
        """
    )


def downgrade() -> None:
    # Revert back to SIM Armada Damkar
    op.execute(
        """
        UPDATE tenant_settings 
        SET 
            app_name = 'SIM Armada Damkar Makassar',
            app_short_name = 'SIM Armada'
        """
    )
