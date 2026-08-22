from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.armada import ApprovalStatus, Armada, StatusArmada
from app.models.audit_log import AuditAksi
from app.models.user import User, UserRole
from app.schemas.armada import ArmadaCreate, ArmadaUpdate
from app.services import audit_service
from app.utils.qr_generator import generate_qr_code_value


def _ensure_unique(db: Session, tenant_id: str, field_name: str, value: str | None, exclude_id: int | None = None):
    if not value:
        return
    query = db.query(Armada).filter(
        Armada.tenant_id == tenant_id,
        getattr(Armada, field_name) == value,
        Armada.is_deleted.is_(False)
    )
    if exclude_id:
        query = query.filter(Armada.id != exclude_id)
    if query.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nilai '{value}' sudah digunakan armada lain",
        )


def create_armada(db: Session, payload: ArmadaCreate, current_user: User, tenant_id: str) -> Armada:
    _ensure_unique(db, tenant_id, "kode_armada", payload.kode_armada)
    _ensure_unique(db, tenant_id, "no_polisi", payload.no_polisi)
    _ensure_unique(db, tenant_id, "no_lambung", payload.no_lambung)

    armada = Armada(
        **payload.model_dump(),
        tenant_id=tenant_id,
        qr_code_value=generate_qr_code_value(payload.kode_armada),
        status_armada=StatusArmada.standby,
        status_approval=ApprovalStatus.tidak_perlu,
        created_by=current_user.id,
    )
    db.add(armada)
    db.commit()
    db.refresh(armada)

    audit_service.catat(
        db, current_user.id, AuditAksi.tambah, "armada", armada.id,
        nilai_sesudah={"kode_armada": armada.kode_armada, "status_armada": armada.status_armada.value},
    )
    return armada


def update_armada(db: Session, armada: Armada, payload: ArmadaUpdate, current_user: User) -> Armada:
    data = payload.model_dump(exclude_unset=True)
    if "kode_armada" in data:
        _ensure_unique(db, armada.tenant_id, "kode_armada", data["kode_armada"], exclude_id=armada.id)
    if "no_polisi" in data:
        _ensure_unique(db, armada.tenant_id, "no_polisi", data["no_polisi"], exclude_id=armada.id)
    if "no_lambung" in data:
        _ensure_unique(db, armada.tenant_id, "no_lambung", data["no_lambung"], exclude_id=armada.id)

    for key, value in data.items():
        setattr(armada, key, value)
    db.commit()
    db.refresh(armada)

    audit_service.catat(
        db, current_user.id, AuditAksi.edit, "armada", armada.id, nilai_sesudah=data
    )
    return armada


def can_delete(armada: Armada, current_user: User) -> bool:
    """Aturan FR-26: Admin boleh hapus semua; Operator hanya data yang ia input sendiri."""
    if current_user.role == UserRole.administrator:
        return True
    return armada.created_by == current_user.id


def soft_delete_armada(db: Session, armada: Armada, current_user: User) -> None:
    if not can_delete(armada, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda hanya dapat menghapus data yang Anda input sendiri",
        )
    armada.is_deleted = True
    db.commit()

    audit_service.catat(
        db, current_user.id, AuditAksi.hapus, "armada", armada.id,
        nilai_sebelum={"kode_armada": armada.kode_armada},
    )
