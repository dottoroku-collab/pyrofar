from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.armada import Armada
from app.models.armada_file import ArmadaFile, JenisFileArmada
from app.models.pemeliharaan import Pemeliharaan
from app.schemas.public import PublicArmada, PublicServisTerakhir
from uuid import UUID
from app.schemas.insiden import InsidenCreate, InsidenResponse
from app.services import insiden_service

router = APIRouter(prefix="/public", tags=["Publik"])


@router.get("/armada/{qr_code_value}", response_model=PublicArmada)
def get_public_armada(qr_code_value: str, db: Session = Depends(get_db)):
    armada = (
        db.query(Armada)
        .filter(Armada.qr_code_value == qr_code_value, Armada.is_deleted.is_(False))
        .first()
    )
    if not armada:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Armada tidak ditemukan")

    foto = (
        db.query(ArmadaFile)
        .filter(
            ArmadaFile.armada_id == armada.id,
            ArmadaFile.jenis_file == JenisFileArmada.foto_depan,
        )
        .first()
    )
    servis_terakhir_row = (
        db.query(Pemeliharaan)
        .filter(Pemeliharaan.armada_id == armada.id, Pemeliharaan.is_deleted.is_(False))
        .order_by(Pemeliharaan.tanggal.desc())
        .first()
    )
    servis_terakhir = None
    if servis_terakhir_row:
        servis_terakhir = PublicServisTerakhir(
            tanggal=servis_terakhir_row.tanggal,
            jenis_pekerjaan=servis_terakhir_row.jenis_pekerjaan,
        )

    return PublicArmada(
        kode_armada=armada.kode_armada,
        jenis=armada.jenis_kendaraan.nama if armada.jenis_kendaraan else None,
        merk_type=f"{armada.merk or ''} {armada.type or ''}".strip() or None,
        no_polisi=armada.no_polisi,
        status_armada=armada.status_armada.value,
        foto_url=foto.file_url if foto else None,
        servis_terakhir=servis_terakhir,
    )

@router.post("/lapor-insiden/{tenant_id}", response_model=InsidenResponse, status_code=status.HTTP_201_CREATED)
def public_create_insiden(tenant_id: UUID, insiden_in: InsidenCreate, db: Session = Depends(get_db)):
    insiden_in.is_verified = False
    return insiden_service.create_insiden(db, tenant_id, insiden_in)
