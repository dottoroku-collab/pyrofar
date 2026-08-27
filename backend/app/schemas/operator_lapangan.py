from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class OperatorLapanganBase(BaseModel):
    nip_nik: str
    foto_url: Optional[str] = None
    sim_file_url: Optional[str] = None
    sim_expiry_date: Optional[date] = None


class OperatorLapanganCreate(OperatorLapanganBase):
    nama: str
    role: str
    password: Optional[str] = None
    armada_id: Optional[int] = None


class OperatorLapanganUpdate(BaseModel):
    nama: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    foto_url: Optional[str] = None
    sim_file_url: Optional[str] = None
    sim_expiry_date: Optional[date] = None
    armada_id: Optional[int] = None


class ArmadaInfo(BaseModel):
    id: int
    nama_armada: Optional[str] = None
    no_polisi: Optional[str] = None
    jenis_kendaraan_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class OperatorLapanganResponse(OperatorLapanganBase):
    id: int
    tenant_id: UUID
    user_id: int
    nama: str
    role: str
    armada: Optional[ArmadaInfo] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
