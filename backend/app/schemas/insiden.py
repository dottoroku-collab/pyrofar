from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from app.models.insiden import JenisInsiden, StatusInsiden

class InsidenBase(BaseModel):
    jenis_insiden: JenisInsiden
    kategori: str
    objek: str
    alamat: str
    pelapor_nama: str
    pelapor_kontak: str
    pelapor_alamat: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    waktu_lapor: Optional[datetime] = None
    status: StatusInsiden = StatusInsiden.menunggu

class InsidenCreate(InsidenBase):
    armada_ids: Optional[List[int]] = None
    is_verified: bool = False

class InsidenUpdate(BaseModel):
    status: Optional[StatusInsiden] = None
    waktu_berangkat: Optional[datetime] = None
    waktu_tiba: Optional[datetime] = None
    waktu_selesai: Optional[datetime] = None
    jumlah_terdampak: Optional[int] = None
    is_verified: Optional[bool] = None
    luas_areal: Optional[int] = None
    korban_meninggal: Optional[int] = None
    korban_luka: Optional[int] = None
    korban_kk: Optional[int] = None
    taksiran_kerugian: Optional[int] = None  # Using int for BigInteger compatibility in Pydantic

class ReguMinimal(BaseModel):
    id: int
    nama: str
    
    model_config = ConfigDict(from_attributes=True)

class InsidenResponse(InsidenBase):
    id: UUID
    tenant_id: UUID
    waktu_lapor: datetime
    waktu_berangkat: Optional[datetime]
    waktu_tiba: Optional[datetime]
    waktu_selesai: Optional[datetime]
    jumlah_terdampak: Optional[int]
    is_verified: bool
    luas_areal: Optional[int] = None
    korban_meninggal: Optional[int] = None
    korban_luka: Optional[int] = None
    korban_kk: Optional[int] = None
    taksiran_kerugian: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    # Simple list of regu IDs or minimal regu response to avoid circular imports for now
    regus: Optional[List[ReguMinimal]] = None

    model_config = ConfigDict(from_attributes=True)

class DispatchReguRequest(BaseModel):
    regu_ids: List[int]
