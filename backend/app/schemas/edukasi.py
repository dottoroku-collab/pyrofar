from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID
from app.models.edukasi import EdukasiKategori, EdukasiStatus

class EdukasiBase(BaseModel):
    kategori: EdukasiKategori
    judul_kegiatan: str
    tanggal_pelaksanaan: datetime
    lokasi: str
    target_audiens: Optional[str] = None
    jumlah_peserta: Optional[int] = 0
    deskripsi: Optional[str] = None
    dokumentasi: Optional[list[Any]] = []
    status: Optional[EdukasiStatus] = EdukasiStatus.scheduled

class EdukasiCreate(EdukasiBase):
    pass

class EdukasiUpdate(BaseModel):
    kategori: Optional[EdukasiKategori] = None
    judul_kegiatan: Optional[str] = None
    tanggal_pelaksanaan: Optional[datetime] = None
    lokasi: Optional[str] = None
    target_audiens: Optional[str] = None
    jumlah_peserta: Optional[int] = None
    status: Optional[EdukasiStatus] = None
    deskripsi: Optional[str] = None
    dokumentasi: Optional[list[Any]] = None

class EdukasiResponse(EdukasiBase):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True
