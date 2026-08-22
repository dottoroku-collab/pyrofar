from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
import uuid

from app.models.relawan import StatusRelawan
from app.models.aset_relawan import StatusAsetRelawan, TipeAsetRelawan

# ============================
# Relawan Schemas
# ============================

class RelawanBase(BaseModel):
    nama: str
    nik: Optional[str] = None
    no_telepon: Optional[str] = None
    alamat: Optional[str] = None
    provinsi: Optional[str] = None
    kota: Optional[str] = None
    kecamatan: Optional[str] = None
    kelurahan: Optional[str] = None
    pekerjaan: Optional[str] = None
    pendidikan: Optional[str] = None
    golongan_darah: Optional[str] = None
    foto_ktp: Optional[str] = None
    foto_diri: Optional[str] = None
    komunitas: Optional[str] = None
    biodata: Optional[Dict[str, Any]] = {}
    skills: Optional[List[Dict[str, Any]]] = []
    trainings: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[Dict[str, Any]]] = []
    activity_history: Optional[List[Dict[str, Any]]] = []
    incident_participation: Optional[List[Dict[str, Any]]] = []
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    status: StatusRelawan = StatusRelawan.active

class RelawanCreate(RelawanBase):
    pass

class RelawanUpdate(RelawanBase):
    nama: Optional[str] = None
    status: Optional[StatusRelawan] = None

class RelawanResponse(RelawanBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# ============================
# AsetRelawan Schemas
# ============================

class AsetRelawanBase(BaseModel):
    tipe: TipeAsetRelawan
    nama: str
    kapasitas: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    status: StatusAsetRelawan = StatusAsetRelawan.ready

class AsetRelawanCreate(AsetRelawanBase):
    pass

class AsetRelawanUpdate(AsetRelawanBase):
    tipe: Optional[TipeAsetRelawan] = None
    nama: Optional[str] = None
    status: Optional[StatusAsetRelawan] = None

class AsetRelawanResponse(AsetRelawanBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# ============================
# Dashboard Schemas
# ============================

class RelawanDashboardResponse(BaseModel):
    kpi: Dict[str, Any]
    map_data: Dict[str, Any]

# ============================
# Komunitas Relawan Schemas
# ============================

class KomunitasRelawanBase(BaseModel):
    nama: str
    lokasi: str
    jumlah_anggota: int = 0
    status: str = "active"
    kontak_utama: Optional[str] = None
    nomor_telepon: Optional[str] = None

class KomunitasRelawanCreate(KomunitasRelawanBase):
    pass

class KomunitasRelawanUpdate(BaseModel):
    nama: Optional[str] = None
    lokasi: Optional[str] = None
    jumlah_anggota: Optional[int] = None
    status: Optional[str] = None
    kontak_utama: Optional[str] = None
    nomor_telepon: Optional[str] = None

class KomunitasRelawanResponse(KomunitasRelawanBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# ============================
# Pelatihan Relawan Schemas
# ============================
from datetime import date, datetime

class PelatihanRelawanBase(BaseModel):
    nama: str
    tanggal: date
    kapasitas: int
    peserta_terdaftar: int = 0
    status: str = "upcoming"
    lokasi: Optional[str] = None
    deskripsi: Optional[str] = None

class PelatihanRelawanCreate(PelatihanRelawanBase):
    pass

class PelatihanRelawanUpdate(BaseModel):
    nama: Optional[str] = None
    tanggal: Optional[date] = None
    kapasitas: Optional[int] = None
    peserta_terdaftar: Optional[int] = None
    status: Optional[str] = None
    lokasi: Optional[str] = None
    deskripsi: Optional[str] = None

class PelatihanRelawanResponse(PelatihanRelawanBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# ============================
# Insiden Relawan Schemas
# ============================

class InsidenRelawanBase(BaseModel):
    judul: str
    tanggal: datetime
    lokasi: str
    skala: str = "kecil"
    status: str = "aktif"
    deskripsi: Optional[str] = None
    jumlah_korban: Optional[int] = None

class InsidenRelawanCreate(InsidenRelawanBase):
    pass

class InsidenRelawanUpdate(BaseModel):
    judul: Optional[str] = None
    tanggal: Optional[datetime] = None
    lokasi: Optional[str] = None
    skala: Optional[str] = None
    status: Optional[str] = None
    deskripsi: Optional[str] = None
    jumlah_korban: Optional[int] = None

class InsidenRelawanResponse(InsidenRelawanBase):
    id: uuid.UUID
    tenant_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
