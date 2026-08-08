from datetime import datetime

from pydantic import BaseModel


class NotifikasiPublic(BaseModel):
    id: int
    armada_id: int | None
    jenis: str | None
    pesan: str | None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
