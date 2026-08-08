from typing import Any

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
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            aksi=aksi,
            entitas=entitas,
            entitas_id=entitas_id,
            nilai_sebelum=nilai_sebelum,
            nilai_sesudah=nilai_sesudah,
        )
    )
    db.commit()
