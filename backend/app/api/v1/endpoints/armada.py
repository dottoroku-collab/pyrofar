from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role, require_feature
from app.models.armada import Armada
from app.models.armada_file import ArmadaFile, JenisFileArmada
from app.models.histori_lokasi import HistoriLokasi
from app.models.user import User, UserRole
from app.schemas.armada import ArmadaCreate, ArmadaListItem, ArmadaPublic, ArmadaUpdate
from app.schemas.armada_file import ArmadaFilePublic
from app.schemas.lokasi_history import HistoriLokasiPublic, PindahLokasiRequest
from app.schemas.status import HistoriStatusPublic, UbahStatusRequest
from app.schemas.timeline import TimelineItem
from app.services import approval_service, armada_service as svc, lokasi_service, reminder_service, timeline_service, license_service
from app.utils.file_storage import save_upload

router = APIRouter(prefix="/armada", tags=["Data Armada"])


def _get_or_404(db: Session, armada_id: int) -> Armada:
    armada = db.query(Armada).filter(Armada.id == armada_id, Armada.is_deleted.is_(False)).first()
    if not armada:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Armada tidak ditemukan")
    return armada


@router.get("", response_model=list[ArmadaListItem], dependencies=[Depends(require_feature("armada"))])
def list_armada(
    q: str | None = Query(None, description="Cari kode armada / no. polisi / no. lambung"),
    jenis_id: int | None = None,
    lokasi_id: int | None = None,
    status_armada: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Armada).filter(Armada.is_deleted.is_(False))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Armada.kode_armada.ilike(like),
                Armada.no_polisi.ilike(like),
                Armada.no_lambung.ilike(like),
                Armada.merk.ilike(like),
            )
        )
    if jenis_id:
        query = query.filter(Armada.jenis_kendaraan_id == jenis_id)
    if lokasi_id:
        query = query.filter(Armada.lokasi_saat_ini_id == lokasi_id)
    if status_armada:
        query = query.filter(Armada.status_armada == status_armada)

    return (
        query.order_by(Armada.kode_armada)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.post("", response_model=ArmadaPublic, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("armada"))])
def create_armada(
    payload: ArmadaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role([UserRole.administrator, UserRole.operator])
    ),
):
    current_count = (
        db.query(Armada)
        .filter(Armada.is_deleted.is_(False))
        .count()
    )

    if not license_service.check_limit(db, "armada", current_count):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Batas jumlah armada pada lisensi Anda telah tercapai",
        )

    armada = svc.create_armada(db, payload, current_user)
    reminder_service.sinkronkan_jadwal_stnk(db, armada)
    return armada


@router.get("/{armada_id}", response_model=ArmadaPublic, dependencies=[Depends(require_feature("armada"))])
def get_armada(armada_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_404(db, armada_id)


@router.put("/{armada_id}", response_model=ArmadaPublic, dependencies=[Depends(require_feature("armada"))])
def update_armada(
    armada_id: int,
    payload: ArmadaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator, UserRole.operator])),
):
    armada = _get_or_404(db, armada_id)
    updated = svc.update_armada(db, armada, payload, current_user)
    reminder_service.sinkronkan_jadwal_stnk(db, updated)
    return updated


@router.get("/{armada_id}/timeline", response_model=list[TimelineItem], dependencies=[Depends(require_feature("armada"))])
def get_timeline(armada_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_or_404(db, armada_id)
    return timeline_service.get_timeline(db, armada_id)


@router.delete("/{armada_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_feature("armada"))])
def delete_armada(
    armada_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator, UserRole.operator])),
):
    armada = _get_or_404(db, armada_id)
    svc.soft_delete_armada(db, armada, current_user)


@router.get("/{armada_id}/files", response_model=list[ArmadaFilePublic], dependencies=[Depends(require_feature("armada"))])
def list_files(armada_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_or_404(db, armada_id)
    return db.query(ArmadaFile).filter(ArmadaFile.armada_id == armada_id).all()


@router.post("/{armada_id}/files", response_model=ArmadaFilePublic, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("armada"))])
def upload_file(
    armada_id: int,
    jenis_file: JenisFileArmada,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.administrator, UserRole.operator])),
):
    _get_or_404(db, armada_id)
    file_url = save_upload(file, subfolder=f"armada/{armada_id}")
    armada_file = ArmadaFile(
        armada_id=armada_id, jenis_file=jenis_file, file_url=file_url, uploaded_by=current_user.id
    )
    db.add(armada_file)
    db.commit()
    db.refresh(armada_file)
    return armada_file


@router.delete("/{armada_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_feature("armada"))])
def delete_file(
    armada_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role([UserRole.administrator, UserRole.operator])),
):
    armada_file = (
        db.query(ArmadaFile)
        .filter(ArmadaFile.id == file_id, ArmadaFile.armada_id == armada_id)
        .first()
    )
    if not armada_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File tidak ditemukan")
    db.delete(armada_file)
    db.commit()


@router.post("/{armada_id}/pindah-lokasi", response_model=HistoriLokasiPublic, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("armada"))])
def pindah_lokasi(
    armada_id: int,
    payload: PindahLokasiRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.operator])),
):
    armada = _get_or_404(db, armada_id)
    return lokasi_service.pindah_lokasi(db, armada, payload, current_user)


@router.get("/{armada_id}/histori-lokasi", response_model=list[HistoriLokasiPublic], dependencies=[Depends(require_feature("armada"))])
def histori_lokasi(armada_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_or_404(db, armada_id)
    return (
        db.query(HistoriLokasi)
        .filter(HistoriLokasi.armada_id == armada_id)
        .order_by(HistoriLokasi.tanggal_pindah.desc())
        .all()
    )


@router.put("/{armada_id}/status", response_model=HistoriStatusPublic, dependencies=[Depends(require_feature("armada"))])
def ubah_status(
    armada_id: int,
    payload: UbahStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.operator, UserRole.teknisi])),
):
    armada = _get_or_404(db, armada_id)
    return approval_service.ubah_status(db, armada, payload, current_user)
