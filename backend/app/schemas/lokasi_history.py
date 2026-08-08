from datetime import date, datetime

from pydantic import BaseModel


class PindahLokasiRequest(BaseModel):
    lokasi_baru_id: int
    keterangan: str | None = None


class HistoriLokasiPublic(BaseModel):
    id: int
    armada_id: int
    lokasi_lama_id: int | None
    lokasi_baru_id: int
    tanggal_pindah: date
    dipindahkan_oleh: int | None
    keterangan: str | None

    class Config:
        from_attributes = True
