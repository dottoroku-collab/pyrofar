from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.lokasi import Lokasi
from app.models.user import UserRole
from app.schemas.master_data import LokasiCreate, LokasiPublic, LokasiUpdate
from app.services import master_data_service as svc

router = APIRouter(prefix="/lokasi", tags=["Master Data - Lokasi"])


@router.get("", response_model=list[LokasiPublic])
def list_lokasi(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return svc.list_active(db, Lokasi)


@router.post("", response_model=LokasiPublic, status_code=status.HTTP_201_CREATED)
def create_lokasi(
    payload: LokasiCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    return svc.create_named(db, Lokasi, payload.model_dump())


@router.put("/{item_id}", response_model=LokasiPublic)
def update_lokasi(
    item_id: int,
    payload: LokasiUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    item = svc.get_active_or_404(db, Lokasi, item_id)
    return svc.update_named(db, item, payload.model_dump(exclude_unset=True))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lokasi(
    item_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    item = svc.get_active_or_404(db, Lokasi, item_id)
    svc.soft_delete(db, item)
