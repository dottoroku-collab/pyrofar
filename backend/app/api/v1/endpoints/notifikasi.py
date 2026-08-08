from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.notifikasi import Notifikasi
from app.models.user import User
from app.schemas.notifikasi import NotifikasiPublic

router = APIRouter(prefix="/notifikasi", tags=["Notifikasi"])


@router.get("", response_model=list[NotifikasiPublic])
def list_notifikasi(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notifikasi)
        .filter(Notifikasi.user_id == current_user.id)
        .order_by(Notifikasi.created_at.desc())
        .limit(50)
        .all()
    )


@router.put("/{notif_id}/read", response_model=NotifikasiPublic)
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = (
        db.query(Notifikasi)
        .filter(Notifikasi.id == notif_id, Notifikasi.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notifikasi tidak ditemukan")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
