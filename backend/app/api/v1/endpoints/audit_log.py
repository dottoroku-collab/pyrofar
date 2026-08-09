from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role, require_feature
from app.models.audit_log import AuditLog
from app.models.user import UserRole
from app.schemas.audit_log import AuditLogPublic

router = APIRouter(prefix="/audit-log", tags=["Audit Log"])


@router.get("", response_model=list[AuditLogPublic], dependencies=[Depends(require_feature("audit_log"))])
def list_audit_log(
    user_id: int | None = None,
    entitas: str | None = None,
    dari_tanggal: datetime | None = None,
    sampai_tanggal: datetime | None = None,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    query = db.query(AuditLog)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if entitas:
        query = query.filter(AuditLog.entitas == entitas)
    if dari_tanggal:
        query = query.filter(AuditLog.waktu >= dari_tanggal)
    if sampai_tanggal:
        query = query.filter(AuditLog.waktu <= sampai_tanggal)
    return (
        query.order_by(AuditLog.waktu.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
