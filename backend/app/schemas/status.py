from datetime import datetime

from pydantic import BaseModel

from app.models.armada import ApprovalStatus, StatusArmada


class UbahStatusRequest(BaseModel):
    status_baru: StatusArmada
    keterangan: str | None = None


class RejectRequest(BaseModel):
    catatan_approval: str


class HistoriStatusPublic(BaseModel):
    id: int
    armada_id: int
    status_lama: StatusArmada | None
    status_baru: StatusArmada
    tanggal: datetime
    diajukan_oleh: int | None
    butuh_approval: bool
    approval_status: ApprovalStatus
    disetujui_oleh: int | None
    tanggal_approval: datetime | None
    catatan_approval: str | None
    keterangan: str | None

    class Config:
        from_attributes = True
