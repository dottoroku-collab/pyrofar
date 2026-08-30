from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.dependencies.auth import require_permission
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.models.audit_log import AuditAksi
from app.models.user import User, UserRole
from app.schemas.user import UserAdminPublic, UserCreate, UserUpdate

from app.services import audit_service, license_service

router = APIRouter(prefix="/users", tags=["Pengguna"])


@router.get("", response_model=list[UserAdminPublic])
def list_users(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_users")),
):
    query = db.query(User).filter(
        User.tenant_id == ctx.tenant_id,
        User.is_deleted.is_(False)
    )
    if not current_user.is_superadmin:
        query = query.filter(User.is_superadmin.is_(False))

    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.nama).all()


@router.post(
    "",
    response_model=UserAdminPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_users")),
):
    # Cek jumlah user aktif sebelum membuat user baru
    current_count = (
        db.query(User)
        .filter(
            User.tenant_id == ctx.tenant_id,
            User.is_deleted.is_(False)
        )
        .count()
    )

    if not license_service.check_limit(
        db,
        ctx.tenant_id,
        "users",
        current_count,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Batas jumlah pengguna pada lisensi Anda telah tercapai",
        )

    # Cek email & username
    if payload.email:
        exists_email = (
            db.query(User)
            .filter(
                User.tenant_id == ctx.tenant_id,
                User.email == payload.email,
                User.is_deleted.is_(False),
            )
            .first()
        )
        if exists_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email sudah terdaftar",
            )
    
    if payload.username:
        exists_username = (
            db.query(User)
            .filter(
                User.tenant_id == ctx.tenant_id,
                User.username == payload.username,
                User.is_deleted.is_(False),
            )
            .first()
        )
        if exists_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username sudah terdaftar",
            )

    is_superadmin = False
    if payload.is_superadmin and current_user.is_superadmin:
        is_superadmin = True

    # Buat user
    user = User(
        tenant_id=ctx.tenant_id,
        nama=payload.nama,
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_superadmin=is_superadmin,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit
    audit_service.catat(
        db,
        current_user.id,
        AuditAksi.tambah,
        "users",
        user.id,
        nilai_sesudah={
            "email": user.email,
            "username": user.username,
            "role": user.role.value,
        },
        tenant_id=ctx.tenant_id,
    )

    return user


@router.put("/{user_id}", response_model=UserAdminPublic)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_users")),
):
    query = db.query(User).filter(
        User.tenant_id == ctx.tenant_id,
        User.id == user_id,
        User.is_deleted.is_(False)
    )
    
    if not current_user.is_superadmin:
        query = query.filter(User.is_superadmin.is_(False))

    user = query.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan atau Anda tidak memiliki akses")

    data = payload.model_dump(exclude_unset=True)
    if not current_user.is_superadmin and "is_superadmin" in data:
        del data["is_superadmin"]

    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)

    audit_service.catat(db, current_user.id, AuditAksi.edit, "users", user.id, nilai_sesudah=data, tenant_id=ctx.tenant_id)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_users")),
):
    query = db.query(User).filter(
        User.tenant_id == ctx.tenant_id,
        User.id == user_id,
        User.is_deleted.is_(False)
    )
    
    if not current_user.is_superadmin:
        query = query.filter(User.is_superadmin.is_(False))

    user = query.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan atau Anda tidak memiliki akses")
    
    user.is_deleted = True
    db.commit()

    audit_service.catat(db, current_user.id, AuditAksi.hapus, "users", user.id, tenant_id=ctx.tenant_id)


from pydantic import BaseModel
from app.core.security import hash_password

class PasswordReset(BaseModel):
    new_password: str

@router.put("/{user_id}/password")
def reset_user_password(
    user_id: int,
    payload: PasswordReset,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_users")),
):
    query = db.query(User).filter(
        User.tenant_id == ctx.tenant_id,
        User.id == user_id,
        User.is_deleted.is_(False)
    )
    
    if not current_user.is_superadmin:
        query = query.filter(User.is_superadmin.is_(False))

    user = query.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan atau Anda tidak memiliki akses")
        
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    
    audit_service.catat(db, current_user.id, AuditAksi.edit, "users", user.id, nilai_sesudah={"action": "reset_password"}, tenant_id=ctx.tenant_id)
    return {"message": "Password berhasil direset"}
