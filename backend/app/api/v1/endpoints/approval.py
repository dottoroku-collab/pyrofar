from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.status import HistoriStatusPublic, RejectRequest
from app.services import approval_service

router = APIRouter(prefix="/approval", tags=["Approval"])


@router.get("", response_model=list[HistoriStatusPublic])
def list_pending(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.kabid])),
):
    return approval_service.list_pending(db)


@router.post("/{histori_status_id}/approve", response_model=HistoriStatusPublic)
def approve(
    histori_status_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.kabid])),
):
    return approval_service.approve(db, histori_status_id, current_user)


@router.post("/{histori_status_id}/reject", response_model=HistoriStatusPublic)
def reject(
    histori_status_id: int,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.kabid])),
):
    return approval_service.reject(db, histori_status_id, payload.catatan_approval, current_user)
