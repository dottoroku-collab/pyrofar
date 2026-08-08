from datetime import datetime

from pydantic import BaseModel


class TimelineItem(BaseModel):
    tanggal: datetime
    jenis: str  # pendaftaran | pindah_lokasi | ubah_status | pemeliharaan
    judul: str
    deskripsi: str | None = None
