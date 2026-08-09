"""app settings and branding

Revision ID: 0006
Revises: 0005
Create Date: 2026-08-08
"""

from alembic import op
import sqlalchemy as sa


revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "app_name",
            sa.String(150),
            nullable=False,
            server_default="SIM Armada Damkar",
        ),
        sa.Column(
            "app_short_name",
            sa.String(50),
            nullable=False,
            server_default="SIM Armada",
        ),
        sa.Column(
            "organization_name",
            sa.String(200),
            nullable=True,
        ),
        sa.Column(
            "region_name",
            sa.String(150),
            nullable=True,
        ),
        sa.Column(
            "logo_url",
            sa.String(500),
            nullable=True,
        ),
        sa.Column(
            "primary_color",
            sa.String(20),
            nullable=False,
            server_default="#C62828",
        ),
        sa.Column(
            "secondary_color",
            sa.String(20),
            nullable=False,
            server_default="#263238",
        ),
        sa.Column(
            "contact_email",
            sa.String(150),
            nullable=True,
        ),
        sa.Column(
            "contact_phone",
            sa.String(50),
            nullable=True,
        ),
        sa.Column(
            "address",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # Hanya satu konfigurasi global untuk instalasi saat ini.
    op.execute(
        """
        INSERT INTO app_settings (
            id,
            app_name,
            app_short_name,
            organization_name,
            region_name
        )
        VALUES (
            1,
            'SIM Armada Damkar',
            'SIM Armada',
            'Dinas Pemadam Kebakaran & Penyelamatan',
            'Kota Makassar'
        )
        """
    )


def downgrade() -> None:
    op.drop_table("app_settings")