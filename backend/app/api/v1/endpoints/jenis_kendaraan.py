from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.jenis_kendaraan import JenisKendaraan
from app.models.user import UserRole
from app.schemas.master_data import (
    JenisKendaraanCreate,
    JenisKendaraanPublic,
    JenisKendaraanUpdate,
)
from app.services import master_data_service as svc

router = APIRouter(prefix="/jenis-kendaraan", tags=["Master Data - Jenis Kendaraan"])


@router.get("", response_model=list[JenisKendaraanPublic])
def list_jenis_kendaraan(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return svc.list_active(db, JenisKendaraan)


@router.post("", response_model=JenisKendaraanPublic, status_code=status.HTTP_201_CREATED)
def create_jenis_kendaraan(
    payload: JenisKendaraanCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    return svc.create_named(db, JenisKendaraan, payload.model_dump())


@router.put("/{item_id}", response_model=JenisKendaraanPublic)
def update_jenis_kendaraan(
    item_id: int,
    payload: JenisKendaraanUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    item = svc.get_active_or_404(db, JenisKendaraan, item_id)
    return svc.update_named(db, item, payload.model_dump(exclude_unset=True))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_jenis_kendaraan(
    item_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    item = svc.get_active_or_404(db, JenisKendaraan, item_id)
    svc.soft_delete(db, item)
