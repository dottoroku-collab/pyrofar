from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.audit_log import AuditAksi


class AuditLogPublic(BaseModel):
    id: int
    user_id: int | None
    aksi: AuditAksi
    entitas: str
    entitas_id: int | None
    nilai_sebelum: dict[str, Any] | None
    nilai_sesudah: dict[str, Any] | None
    waktu: datetime

    class Config:
        from_attributes = True
