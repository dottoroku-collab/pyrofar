from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.dependencies.auth import get_current_superadmin
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate, TenantPublic
from app.schemas.user import UserAdminPublic
from app.schemas.license import LicenseGenerateRequest, LicenseGenerateResponse
from app.services.license_generator import generate_license_key

router = APIRouter()

@router.get("/tenants", response_model=List[TenantPublic])
def get_all_tenants(
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Get all tenants (Superadmin only)"""
    return db.query(Tenant).filter(Tenant.deleted_at.is_(None)).all()

@router.post("/tenants", response_model=TenantPublic)
def create_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Create a new tenant (Superadmin only)"""
    new_tenant = Tenant(**data.dict())
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    return new_tenant

@router.put("/tenants/{tenant_id}", response_model=TenantPublic)
def update_tenant(
    tenant_id: UUID,
    data: TenantUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Update a tenant (Superadmin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tenant, key, value)
        
    db.commit()
    db.refresh(tenant)
    return tenant

@router.delete("/tenants/{tenant_id}")
def delete_tenant(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Delete a tenant (Superadmin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    from sqlalchemy.sql import func
    from app.models.tenant import TenantStatus
    tenant.deleted_at = func.now()
    tenant.status = TenantStatus.cancelled
    db.commit()
    return {"message": "Tenant deleted successfully"}

@router.get("/tenants/{tenant_id}/users", response_model=List[UserAdminPublic])
def get_tenant_users(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Get all users for a specific tenant (Superadmin only)"""
    return db.query(User).filter(User.tenant_id == tenant_id, User.is_deleted.is_(False)).all()

@router.put("/tenants/{tenant_id}/users/{user_id}/superadmin")
def toggle_user_superadmin(
    tenant_id: UUID,
    user_id: int,
    is_superadmin: dict,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Toggle superadmin status for a user (Superadmin only)"""
    user = db.query(User).filter(User.tenant_id == tenant_id, User.id == user_id, User.is_deleted.is_(False)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
    
    user.is_superadmin = is_superadmin.get("is_superadmin", False)
    db.commit()
    db.refresh(user)
    return {"message": "Status superadmin berhasil diubah", "is_superadmin": user.is_superadmin}

from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from pydantic import BaseModel

class PasswordReset(BaseModel):
    new_password: str

@router.post("/tenants/{tenant_id}/users", response_model=UserAdminPublic, status_code=status.HTTP_201_CREATED)
def create_tenant_user(
    tenant_id: UUID,
    payload: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Create a new user for a specific tenant (Superadmin only)"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.deleted_at.is_(None)).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant tidak ditemukan")
        
    hashed_password = get_password_hash(payload.password)
    new_user = User(
        nama=payload.nama,
        email=payload.email,
        username=payload.username,
        hashed_password=hashed_password,
        role=payload.role,
        is_superadmin=payload.is_superadmin,
        tenant_id=tenant_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/tenants/{tenant_id}/users/{user_id}/password")
def reset_tenant_user_password(
    tenant_id: UUID,
    user_id: int,
    payload: PasswordReset,
    db: Session = Depends(get_db),
    _=Depends(get_current_superadmin),
):
    """Reset a user's password (Superadmin only)"""
    user = db.query(User).filter(User.tenant_id == tenant_id, User.id == user_id, User.is_deleted.is_(False)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Pengguna tidak ditemukan")
        
    user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password berhasil direset"}


@router.post("/licenses/generate", response_model=LicenseGenerateResponse)
def generate_license(
    payload: LicenseGenerateRequest,
    _=Depends(get_current_superadmin),
):
    """Generate a new license key (Superadmin only)"""
    result = generate_license_key(
        plan_code=payload.plan_code,
        organization_name=payload.organization_name,
        years=payload.years,
    )
    return result
