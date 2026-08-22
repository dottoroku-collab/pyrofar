from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.armada import ApprovalStatus, Armada, StatusArmada
from app.models.audit_log import AuditAksi
from app.models.histori_status import HistoriStatus
from app.models.user import User, UserRole
from app.schemas.status import UbahStatusRequest
from app.services import audit_service, notifikasi_service

# BR-03: status berikut wajib melalui approval Kabid
STATUS_KRITIS = {StatusArmada.rusak_berat, StatusArmada.tidak_aktif}


def ubah_status(
    db: Session, armada: Armada, payload: UbahStatusRequest, current_user: User
) -> HistoriStatus:
    status_lama = armada.status_armada
    is_kritis = payload.status_baru in STATUS_KRITIS

    histori = HistoriStatus(
        tenant_id=armada.tenant_id,
        armada_id=armada.id,
        status_lama=status_lama,
        status_baru=payload.status_baru,
        diajukan_oleh=current_user.id,
        butuh_approval=False,  # No longer requires approval
        approval_status=ApprovalStatus.tidak_perlu,
        keterangan=payload.keterangan,
    )
    db.add(histori)

    armada.status_armada = payload.status_baru
    armada.status_approval = ApprovalStatus.tidak_perlu

    db.commit()
    db.refresh(histori)

    if is_kritis:
        notifikasi_service.notify_users_by_role(
            db,
            UserRole.pimpinan,
            jenis="informasi",
            pesan=(
                f"Armada {armada.kode_armada} telah diubah statusnya menjadi "
                f"{payload.status_baru.value} oleh {current_user.nama}."
            ),
            armada_id=armada.id,
            tenant_id=armada.tenant_id,
        )

    audit_service.catat(
        db, current_user.id, AuditAksi.edit, "armada", armada.id,
        nilai_sebelum={"status_lama": status_lama.value},
        nilai_sesudah={"status_baru": payload.status_baru.value},
        tenant_id=current_user.tenant_id,
    )

    return histori
