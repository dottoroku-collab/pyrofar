from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_permission
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.models.user import User, UserRole
from app.schemas.license import (
    LicenseActivateRequest,
    LicenseStatusResponse,
)
from app.services import license_service


router = APIRouter(
    prefix="/license",
    tags=["License"],
)


@router.get(
    "",
    response_model=LicenseStatusResponse,
)
def get_license(
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _: User = Depends(get_current_user),
):
    return license_service.get_license_status(db, ctx.tenant_id)


@router.post(
    "/activate",
    response_model=LicenseStatusResponse,
)
def activate_license(
    payload: LicenseActivateRequest,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_license")),
):
    return license_service.activate_license(
        db,
        ctx.tenant_id,
        payload.license_key,
    )