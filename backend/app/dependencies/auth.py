from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

from app.services import license_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_error

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    user = db.query(User).filter(User.id == int(user_id), User.is_deleted.is_(False)).first()
    if user is None or not user.is_active:
        raise credentials_error

    return user


def require_role(allowed_roles: list[UserRole]):
    """Dependency factory: batasi endpoint hanya untuk role tertentu.
    Contoh: Depends(require_role([UserRole.administrator]))
    """

    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki akses untuk aksi ini",
            )
        return current_user

    return _checker


def require_permission(required_permission: str):
    """Dependency factory: batasi endpoint berdasarkan permission granular."""

    def _checker(current_user: User = Depends(get_current_user)) -> User:
        from app.core.permissions import has_permission, Permission

        try:
            perm_enum = Permission(required_permission)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Permission {required_permission} tidak dikenal di sistem",
            )

        if not has_permission(current_user.role, perm_enum):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin (permission) untuk aksi ini",
            )
        return current_user

    return _checker


def require_feature(feature_code: str):
    """Dependency factory: batasi endpoint berdasarkan feature license."""

    def _checker(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> User:
        if not license_service.has_feature(db, current_user.tenant_id, feature_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_code}' tidak tersedia pada lisensi ini",
            )

        return current_user

    return _checker
