from sqlalchemy.orm import Session

from app.models.armada import Armada
from app.models.audit_log import AuditAksi
from app.models.histori_lokasi import HistoriLokasi
from app.models.user import User
from app.schemas.lokasi_history import PindahLokasiRequest
from app.services import audit_service


def pindah_lokasi(
    db: Session, armada: Armada, payload: PindahLokasiRequest, current_user: User
) -> HistoriLokasi:
    histori = HistoriLokasi(
        armada_id=armada.id,
        lokasi_lama_id=armada.lokasi_saat_ini_id,
        lokasi_baru_id=payload.lokasi_baru_id,
        dipindahkan_oleh=current_user.id,
        keterangan=payload.keterangan,
    )
    db.add(histori)
    armada.lokasi_saat_ini_id = payload.lokasi_baru_id
    db.commit()
    db.refresh(histori)

    audit_service.catat(
        db, current_user.id, AuditAksi.pindah_lokasi, "armada", armada.id,
        nilai_sesudah={"lokasi_baru_id": payload.lokasi_baru_id},
    )
    return histori
