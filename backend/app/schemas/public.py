from datetime import date

from pydantic import BaseModel


class PublicServisTerakhir(BaseModel):
    tanggal: date
    jenis_pekerjaan: str | None = None


class PublicArmada(BaseModel):
    kode_armada: str
    jenis: str | None = None
    merk_type: str | None = None
    no_polisi: str | None = None
    status_armada: str
    foto_url: str | None = None
    servis_terakhir: PublicServisTerakhir | None = None
