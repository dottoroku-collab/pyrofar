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
    if armada.status_approval == ApprovalStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Armada ini masih menunggu keputusan approval sebelumnya",
        )

    status_lama = armada.status_armada
    is_kritis = payload.status_baru in STATUS_KRITIS

    histori = HistoriStatus(
        armada_id=armada.id,
        status_lama=status_lama,
        status_baru=payload.status_baru,
        diajukan_oleh=current_user.id,
        butuh_approval=is_kritis,
        approval_status=ApprovalStatus.pending if is_kritis else ApprovalStatus.tidak_perlu,
        keterangan=payload.keterangan,
    )
    db.add(histori)

    if is_kritis:
        armada.status_armada = StatusArmada.menunggu_approval
        armada.status_approval = ApprovalStatus.pending
    else:
        armada.status_armada = payload.status_baru
        armada.status_approval = ApprovalStatus.tidak_perlu

    db.commit()
    db.refresh(histori)

    if is_kritis:
        notifikasi_service.notify_users_by_role(
            db,
            UserRole.kabid,
            jenis="approval",
            pesan=(
                f"Armada {armada.kode_armada} mengajukan status "
                f"{payload.status_baru.value}, menunggu approval Anda."
            ),
            armada_id=armada.id,
        )

    audit_service.catat(
        db, current_user.id, AuditAksi.edit, "armada", armada.id,
        nilai_sebelum={"status_lama": status_lama.value},
        nilai_sesudah={"status_baru": payload.status_baru.value, "butuh_approval": is_kritis},
    )

    return histori


def _get_pending_or_404(db: Session, histori_status_id: int) -> HistoriStatus:
    histori = (
        db.query(HistoriStatus)
        .filter(HistoriStatus.id == histori_status_id, HistoriStatus.approval_status == ApprovalStatus.pending)
        .first()
    )
    if not histori:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengajuan tidak ditemukan atau sudah diproses",
        )
    return histori


def approve(db: Session, histori_status_id: int, current_user: User) -> HistoriStatus:
    histori = _get_pending_or_404(db, histori_status_id)
    armada = db.query(Armada).filter(Armada.id == histori.armada_id).first()

    histori.approval_status = ApprovalStatus.disetujui
    histori.disetujui_oleh = current_user.id
    histori.tanggal_approval = datetime.now(timezone.utc)

    armada.status_armada = histori.status_baru
    armada.status_approval = ApprovalStatus.disetujui

    db.commit()
    db.refresh(histori)

    if histori.diajukan_oleh:
        notifikasi_service.notify_user(
            db,
            histori.diajukan_oleh,
            jenis="approval",
            pesan=f"Pengajuan status {histori.status_baru.value} untuk armada {armada.kode_armada} disetujui.",
            armada_id=armada.id,
        )

    audit_service.catat(
        db, current_user.id, AuditAksi.approve, "histori_status", histori.id,
        nilai_sesudah={"armada_id": armada.id, "status_baru": histori.status_baru.value},
    )
    return histori


def reject(db: Session, histori_status_id: int, catatan: str, current_user: User) -> HistoriStatus:
    histori = _get_pending_or_404(db, histori_status_id)
    armada = db.query(Armada).filter(Armada.id == histori.armada_id).first()

    histori.approval_status = ApprovalStatus.ditolak
    histori.disetujui_oleh = current_user.id
    histori.tanggal_approval = datetime.now(timezone.utc)
    histori.catatan_approval = catatan

    armada.status_armada = histori.status_lama or StatusArmada.standby
    armada.status_approval = ApprovalStatus.tidak_perlu

    db.commit()
    db.refresh(histori)

    if histori.diajukan_oleh:
        notifikasi_service.notify_user(
            db,
            histori.diajukan_oleh,
            jenis="approval",
            pesan=(
                f"Pengajuan status {histori.status_baru.value} untuk armada "
                f"{armada.kode_armada} ditolak: {catatan}"
            ),
            armada_id=armada.id,
        )

    audit_service.catat(
        db, current_user.id, AuditAksi.reject, "histori_status", histori.id,
        nilai_sesudah={"armada_id": armada.id, "catatan_approval": catatan},
    )
    return histori


def list_pending(db: Session):
    return (
        db.query(HistoriStatus)
        .filter(HistoriStatus.approval_status == ApprovalStatus.pending)
        .order_by(HistoriStatus.tanggal.desc())
        .all()
    )
