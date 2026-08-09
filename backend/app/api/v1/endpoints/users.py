from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.dependencies.auth import require_role
from app.models.audit_log import AuditAksi
from app.models.user import User, UserRole
from app.schemas.user import UserAdminPublic, UserCreate, UserUpdate

from app.services import audit_service, license_service

router = APIRouter(prefix="/users", tags=["Pengguna"])


@router.get("", response_model=list[UserAdminPublic])
def list_users(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator])),
):
    query = db.query(User).filter(User.is_deleted.is_(False))
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
    current_user: User = Depends(
        require_role([UserRole.administrator])
    ),
):
    # Cek jumlah user aktif sebelum membuat user baru
    current_count = (
        db.query(User)
        .filter(User.is_deleted.is_(False))
        .count()
    )

    if not license_service.check_limit(
        db,
        "users",
        current_count,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Batas jumlah pengguna pada lisensi Anda telah tercapai",
        )

    # Cek email
    exists = (
        db.query(User)
        .filter(
            User.email == payload.email,
            User.is_deleted.is_(False),
        )
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar",
        )

    # Buat user
    user = User(
        nama=payload.nama,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
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
            "role": user.role.value,
        },
    )

    return user


@router.put("/{user_id}", response_model=UserAdminPublic)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator])),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted.is_(False)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)

    audit_service.catat(db, current_user.id, AuditAksi.edit, "users", user.id, nilai_sesudah=data)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator])),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted.is_(False)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan")
    user.is_deleted = True
    db.commit()

    audit_service.catat(db, current_user.id, AuditAksi.hapus, "users", user.id)
