"""Pydantic schemas for Tenant and TenantSettings."""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ------------------------------------------------------------------ #
# Tenant                                                              #
# ------------------------------------------------------------------ #

class TenantCreate(BaseModel):
    name: str
    slug: str
    status: str = "active"
    plan_code: str = "free"


class TenantUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    status: str | None = None
    plan_code: str | None = None


class TenantPublic(BaseModel):
    id: UUID
    name: str
    slug: str
    status: str
    plan_code: str
    created_at: datetime

    class Config:
        from_attributes = True


# ------------------------------------------------------------------ #
# TenantSettings                                                      #
# ------------------------------------------------------------------ #

class TenantSettingsPublic(BaseModel):
    tenant_id: UUID
    app_name: str
    app_short_name: str
    organization_name: str | None = None
    region_name: str | None = None
    logo_url: str | None = None
    primary_color: str
    secondary_color: str
    contact_email: str | None = None
    contact_phone: str | None = None
    address: str | None = None
    personnel_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    dashboard_video_url: str | None = None
    dashboard_image_url: str | None = None
    dashboard_running_text: str | None = None

    # WhatsApp Gateway Settings
    wa_enabled: bool = True
    wa_provider: str = "fonnte"
    wa_api_token: str | None = None
    wa_api_url: str | None = "https://api.fonnte.com/send"
    wa_siaga_target: str | None = None
    wa_instance_name: str | None = "sim-armada"

    updated_at: datetime

    class Config:
        from_attributes = True


class TenantSettingsUpdate(BaseModel):
    app_name: str | None = None
    app_short_name: str | None = None
    organization_name: str | None = None
    region_name: str | None = None
    logo_url: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address: str | None = None
    personnel_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    dashboard_video_url: str | None = None
    dashboard_image_url: str | None = None
    dashboard_running_text: str | None = None

    # WhatsApp Gateway Settings
    wa_enabled: bool | None = None
    wa_provider: str | None = None
    wa_api_token: str | None = None
    wa_api_url: str | None = None
    wa_siaga_target: str | None = None
    wa_instance_name: str | None = None


# ------------------------------------------------------------------ #
# Combined "me" response                                              #
# ------------------------------------------------------------------ #

class TenantMeResponse(BaseModel):
    tenant: TenantPublic
    settings: TenantSettingsPublic
