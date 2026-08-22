from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.armada import Armada, StatusArmada
from app.models.audit_log import AuditAksi
from app.models.pemeliharaan import Pemeliharaan, StatusPemeliharaan
from app.models.sparepart import Sparepart
from app.models.user import User, UserRole
from app.schemas.pemeliharaan import PemeliharaanCreate, PemeliharaanUpdate
from app.services import audit_service


def create_pemeliharaan(db: Session, payload: PemeliharaanCreate, current_user: User, tenant_id: str) -> Pemeliharaan:
    armada = (
        db.query(Armada).filter(
            Armada.tenant_id == tenant_id,
            Armada.id == payload.armada_id,
            Armada.is_deleted.is_(False)
        ).first()
    )
    if not armada:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Armada tidak ditemukan")

    data = payload.model_dump(exclude={"sparepart"})
    pemeliharaan = Pemeliharaan(
        **data,
        tenant_id=tenant_id,
        input_oleh=current_user.id
    )
    db.add(pemeliharaan)
    db.flush()  # dapatkan id sebelum commit, untuk sparepart anak

    for sp in payload.sparepart:
        db.add(Sparepart(**sp.model_dump(), pemeliharaan_id=pemeliharaan.id))

    # BR: entri pemeliharaan baru otomatis menandai armada sedang ditangani,
    # kecuali armada sedang menunggu approval status kritis (tidak boleh ditimpa).
    if armada.status_armada != StatusArmada.menunggu_approval:
        armada.status_armada = StatusArmada.pemeliharaan

    db.commit()
    db.refresh(pemeliharaan)

    audit_service.catat(
        db, current_user.id, AuditAksi.input_maintenance, "pemeliharaan", pemeliharaan.id,
        nilai_sesudah={"armada_id": armada.id, "jenis_pekerjaan": pemeliharaan.jenis_pekerjaan},
    )
    return pemeliharaan


def update_pemeliharaan(db: Session, pemeliharaan: Pemeliharaan, payload: PemeliharaanUpdate) -> Pemeliharaan:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(pemeliharaan, key, value)

    if payload.status == StatusPemeliharaan.selesai:
        armada = db.query(Armada).filter(Armada.id == pemeliharaan.armada_id).first()
        if armada and armada.status_armada == StatusArmada.pemeliharaan:
            armada.status_armada = StatusArmada.standby

    db.commit()
    db.refresh(pemeliharaan)
    return pemeliharaan


def can_delete(pemeliharaan: Pemeliharaan, current_user: User) -> bool:
    """FR-26: Admin boleh hapus semua; Teknisi hanya data yang ia input sendiri."""
    if current_user.role == UserRole.administrator:
        return True
    return pemeliharaan.input_oleh == current_user.id


def soft_delete(db: Session, pemeliharaan: Pemeliharaan, current_user: User) -> None:
    if not can_delete(pemeliharaan, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda hanya dapat menghapus data yang Anda input sendiri",
        )
    pemeliharaan.is_deleted = True
    db.commit()

    audit_service.catat(
        db, current_user.id, AuditAksi.hapus, "pemeliharaan", pemeliharaan.id,
        nilai_sebelum={"armada_id": pemeliharaan.armada_id},
    )
