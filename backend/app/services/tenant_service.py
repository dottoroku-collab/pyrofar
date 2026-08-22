"""Tenant service — CRUD for tenants and tenant_settings."""
from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.tenant import Tenant, TenantSettings
from app.schemas.tenant import TenantSettingsUpdate


def get_tenant_by_id(db: Session, tenant_id: UUID) -> Tenant | None:
    return db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.deleted_at.is_(None),
    ).first()


def get_tenant_settings(db: Session, tenant_id: UUID) -> TenantSettings | None:
    return db.query(TenantSettings).filter(
        TenantSettings.tenant_id == tenant_id,
    ).first()


def update_tenant_settings(
    db: Session,
    tenant_id: UUID,
    data: TenantSettingsUpdate,
) -> TenantSettings:
    settings = get_tenant_settings(db, tenant_id)
    if settings is None:
        # Auto-create if missing (should not happen after migration, but
        # defensive fallback)
        settings = TenantSettings(tenant_id=tenant_id)
        db.add(settings)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
