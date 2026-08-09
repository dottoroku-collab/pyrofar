from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
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
):
    return license_service.get_license_status(db)


@router.post(
    "/activate",
    response_model=LicenseStatusResponse,
)
def activate_license(
    payload: LicenseActivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.administrator:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Hanya Administrator yang dapat "
                "mengaktifkan lisensi"
            ),
        )

    return license_service.activate_license(
        db,
        payload.license_key,
    )