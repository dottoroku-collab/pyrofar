from datetime import date

from pydantic import BaseModel

from app.models.jadwal_servis import JenisReminder


class JadwalServisCreate(BaseModel):
    armada_id: int
    jenis_reminder: JenisReminder
    tanggal_jatuh_tempo: date
    ambang_hari_reminder: int = 30


class JadwalServisPublic(BaseModel):
    id: int
    armada_id: int
    jenis_reminder: JenisReminder
    tanggal_jatuh_tempo: date
    ambang_hari_reminder: int
    status: str

    class Config:
        from_attributes = True
