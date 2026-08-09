from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.dependencies.auth import get_current_user
from app.models.audit_log import AuditAksi
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserPublic
from app.services import audit_service
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.is_deleted.is_(False))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif, hubungi Administrator",
        )

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id, user.role.value)

    audit_service.catat(db, user.id, AuditAksi.login, "auth", user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )

@router.post("/token", response_model=TokenResponse)
@limiter.limit("5/minute")
def token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == form_data.username,
            User.is_deleted.is_(False),
        )
        .first()
    )

    if not user or not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif, hubungi Administrator",
        )

    access_token = create_access_token(
        user.id,
        user.role.value,
    )

    refresh_token = create_refresh_token(
        user.id,
        user.role.value,
    )

    audit_service.catat(
        db,
        user.id,
        AuditAksi.login,
        "auth",
        user.id,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic.model_validate(user),
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak valid atau sudah kedaluwarsa",
        )

    user = db.query(User).filter(User.id == int(data["sub"]), User.is_deleted.is_(False)).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Akun tidak ditemukan")

    access_token = create_access_token(user.id, user.role.value)
    new_refresh_token = create_refresh_token(user.id, user.role.value)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserPublic.model_validate(user),
    )


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)
