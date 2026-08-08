from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.pemeliharaan import Pemeliharaan
from app.models.sparepart import Sparepart
from app.models.user import User, UserRole
from app.schemas.pemeliharaan import (
    PemeliharaanCreate,
    PemeliharaanPublic,
    PemeliharaanUpdate,
    SparepartCreate,
    SparepartPublic,
)
from app.services import pemeliharaan_service as svc
from app.utils.file_storage import save_upload

router = APIRouter(prefix="/pemeliharaan", tags=["Pemeliharaan"])


def _get_or_404(db: Session, pemeliharaan_id: int) -> Pemeliharaan:
    item = (
        db.query(Pemeliharaan)
        .filter(Pemeliharaan.id == pemeliharaan_id, Pemeliharaan.is_deleted.is_(False))
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data pemeliharaan tidak ditemukan")
    return item


@router.get("", response_model=list[PemeliharaanPublic])
def list_pemeliharaan(
    armada_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Pemeliharaan).filter(Pemeliharaan.is_deleted.is_(False))
    if armada_id:
        query = query.filter(Pemeliharaan.armada_id == armada_id)
    if status_filter:
        query = query.filter(Pemeliharaan.status == status_filter)
    return query.order_by(Pemeliharaan.tanggal.desc()).all()


@router.post("", response_model=PemeliharaanPublic, status_code=status.HTTP_201_CREATED)
def create_pemeliharaan(
    payload: PemeliharaanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    return svc.create_pemeliharaan(db, payload, current_user)


@router.get("/{pemeliharaan_id}", response_model=PemeliharaanPublic)
def get_pemeliharaan(pemeliharaan_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_404(db, pemeliharaan_id)


@router.put("/{pemeliharaan_id}", response_model=PemeliharaanPublic)
def update_pemeliharaan(
    pemeliharaan_id: int,
    payload: PemeliharaanUpdate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    item = _get_or_404(db, pemeliharaan_id)
    return svc.update_pemeliharaan(db, item, payload)


@router.delete("/{pemeliharaan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pemeliharaan(
    pemeliharaan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_or_404(db, pemeliharaan_id)
    svc.soft_delete(db, item, current_user)


@router.post("/{pemeliharaan_id}/sparepart", response_model=SparepartPublic, status_code=status.HTTP_201_CREATED)
def add_sparepart(
    pemeliharaan_id: int,
    payload: SparepartCreate,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    _get_or_404(db, pemeliharaan_id)
    sparepart = Sparepart(**payload.model_dump(), pemeliharaan_id=pemeliharaan_id)
    db.add(sparepart)
    db.commit()
    db.refresh(sparepart)
    return sparepart


@router.delete("/{pemeliharaan_id}/sparepart/{sparepart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sparepart(
    pemeliharaan_id: int,
    sparepart_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    sparepart = (
        db.query(Sparepart)
        .filter(Sparepart.id == sparepart_id, Sparepart.pemeliharaan_id == pemeliharaan_id)
        .first()
    )
    if not sparepart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sparepart tidak ditemukan")
    sparepart.is_deleted = True
    db.commit()


@router.post("/{pemeliharaan_id}/foto-sebelum", response_model=PemeliharaanPublic)
def upload_foto_sebelum(
    pemeliharaan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    item = _get_or_404(db, pemeliharaan_id)
    item.foto_sebelum_url = save_upload(file, subfolder=f"pemeliharaan/{pemeliharaan_id}")
    db.commit()
    db.refresh(item)
    return item


@router.post("/{pemeliharaan_id}/foto-sesudah", response_model=PemeliharaanPublic)
def upload_foto_sesudah(
    pemeliharaan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.teknisi])),
):
    item = _get_or_404(db, pemeliharaan_id)
    item.foto_sesudah_url = save_upload(file, subfolder=f"pemeliharaan/{pemeliharaan_id}")
    db.commit()
    db.refresh(item)
    return item
