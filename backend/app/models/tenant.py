"""Tenant and TenantSettings SQLAlchemy models."""
from __future__ import annotations

import enum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    Integer,
    Float,
    func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class TenantStatus(str, enum.Enum):
    active    = "active"
    trial     = "trial"
    suspended = "suspended"
    cancelled = "cancelled"


class Tenant(Base):
    __tablename__ = "tenants"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name       = Column(String(200), nullable=False)
    slug       = Column(String(100), nullable=False, unique=True)
    status     = Column(
        Enum(TenantStatus, name="tenant_status_enum"),
        nullable=False,
        default=TenantStatus.active,
    )
    plan_code  = Column(String(50), nullable=False, default="BASIC")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)


class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id         = Column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    app_name          = Column(String(150), nullable=False, default="DAMKAR Cloud")
    app_short_name    = Column(String(50),  nullable=False, default="DAMKAR")
    organization_name = Column(String(200), nullable=True)
    region_name       = Column(String(150), nullable=True)
    logo_url          = Column(String(500), nullable=True)
    primary_color     = Column(String(20),  nullable=False, default="#C62828")
    secondary_color   = Column(String(20),  nullable=False, default="#1A1D23")
    contact_email     = Column(String(150), nullable=True)
    contact_phone     = Column(String(50),  nullable=True)
    address           = Column(Text(),      nullable=True)
    personnel_count   = Column(Integer,     nullable=True)
    latitude          = Column(Float,       nullable=True)
    longitude         = Column(Float,       nullable=True)
    dashboard_video_url = Column(String(500), nullable=True)
    dashboard_image_url = Column(String(500), nullable=True)
    dashboard_running_text = Column(Text(), nullable=True)

    # WhatsApp Gateway Settings
    wa_enabled        = Column(Boolean, nullable=False, default=True)
    wa_provider       = Column(String(50), nullable=False, default="fonnte")
    wa_api_token      = Column(String(255), nullable=True)
    wa_api_url        = Column(String(255), nullable=True, default="https://api.fonnte.com/send")
    wa_siaga_target   = Column(Text, nullable=True)
    wa_instance_name  = Column(String(100), nullable=True, default="sim-armada")

    updated_at        = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
