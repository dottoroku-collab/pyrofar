"""Tenant context dependency for FastAPI endpoints.

Usage in any tenant-scoped endpoint:

    @router.get("/armada")
    def list_armada(
        ctx: TenantContext = Depends(get_tenant_context),
        db: Session = Depends(get_db),
    ):
        return armada_service.list_armada(db, tenant_id=ctx.tenant_id)

Security guarantee:
- tenant_id is ALWAYS read from the authenticated user's DB record.
- Any tenant_id supplied by the frontend (query param, body) is ignored.
- Cross-tenant access returns 403/404.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.tenant import Tenant, TenantStatus
from app.models.user import User


class TenantContext:
    """Resolved tenant + authenticated user for the current request."""

    def __init__(self, tenant: Tenant, user: User) -> None:
        self.tenant: Tenant = tenant
        self.tenant_id: UUID = tenant.id
        self.user: User = user

    @property
    def is_active(self) -> bool:
        return self.tenant.status in (TenantStatus.active, TenantStatus.trial)


def get_tenant_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TenantContext:
    """Resolve and validate the tenant for the authenticated request.

    Raises 403 if:
    - The user has no tenant_id (orphaned account)
    - The tenant does not exist or is soft-deleted
    - The tenant is suspended or cancelled
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun ini tidak terhubung ke tenant manapun.",
        )

    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.id == current_user.tenant_id,
            Tenant.deleted_at.is_(None),
        )
        .first()
    )

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant tidak ditemukan atau telah dihapus.",
        )

    if tenant.status in (TenantStatus.suspended, TenantStatus.cancelled):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Akses ditolak. Status tenant: {tenant.status.value}.",
        )

    return TenantContext(tenant=tenant, user=current_user)
