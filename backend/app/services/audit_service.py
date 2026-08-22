from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditAksi, AuditLog


def catat(
    db: Session,
    user_id: int | None,
    aksi: AuditAksi,
    entitas: str,
    entitas_id: int | None = None,
    nilai_sebelum: dict[str, Any] | None = None,
    nilai_sesudah: dict[str, Any] | None = None,
    tenant_id: UUID | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Append an immutable audit log entry.

    All parameters except db, user_id, aksi, and entitas are optional
    to preserve backward compatibility with existing call sites.
    """
    db.add(
        AuditLog(
            user_id=user_id,
            aksi=aksi,
            entitas=entitas,
            entitas_id=entitas_id,
            nilai_sebelum=nilai_sebelum,
            nilai_sesudah=nilai_sesudah,
            tenant_id=tenant_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )
    db.commit()
