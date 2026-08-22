from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Float, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True)
    # tenant_id added in migration 0009 for multi-tenant support.
    # app_settings is a legacy table; tenant_settings is the canonical source from Phase 1.
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)

    app_name = Column(
        String(150),
        nullable=False,
        default="PYROFAR",
    )

    app_short_name = Column(
        String(50),
        nullable=False,
        default="PYROFAR",
    )

    organization_name = Column(
        String(200),
        nullable=True,
    )

    region_name = Column(
        String(150),
        nullable=True,
    )

    logo_url = Column(
        String(500),
        nullable=True,
    )

    primary_color = Column(
        String(20),
        nullable=False,
        default="#C62828",
    )

    secondary_color = Column(
        String(20),
        nullable=False,
        default="#263238",
    )

    contact_email = Column(
        String(150),
        nullable=True,
    )

    contact_phone = Column(
        String(50),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    personnel_count = Column(
        Integer,
        nullable=True,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    dashboard_video_url = Column(
        String(500),
        nullable=True,
    )

    dashboard_image_url = Column(
        String(500),
        nullable=True,
    )

    dashboard_running_text = Column(
        Text,
        nullable=True,
    )

    # WhatsApp Gateway Settings
    wa_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    wa_provider = Column(
        String(50),
        nullable=False,
        default="fonnte",
    )

    wa_api_token = Column(
        String(255),
        nullable=True,
    )

    wa_api_url = Column(
        String(255),
        nullable=True,
        default="https://api.fonnte.com/send",
    )

    wa_siaga_target = Column(
        Text,
        nullable=True,
    )

    wa_instance_name = Column(
        String(100),
        nullable=True,
        default="sim-armada",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        onupdate=func.now(),
    )