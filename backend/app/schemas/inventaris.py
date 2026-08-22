from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.inventaris import KondisiBarang, TipeBarang

class InventarisBase(BaseModel):
    nama_barang: str
    kategori: str
    tipe_barang: TipeBarang = TipeBarang.equipment
    jumlah: int = 1
    kondisi: KondisiBarang = KondisiBarang.baik
    lokasi_id: Optional[int] = None
    armada_id: Optional[int] = None
    metadata_tambahan: Optional[Dict[str, Any]] = None

class InventarisCreate(InventarisBase):
    pass

class InventarisUpdate(BaseModel):
    nama_barang: Optional[str] = None
    kategori: Optional[str] = None
    tipe_barang: Optional[TipeBarang] = None
    jumlah: Optional[int] = None
    kondisi: Optional[KondisiBarang] = None
    lokasi_id: Optional[int] = None
    armada_id: Optional[int] = None
    metadata_tambahan: Optional[Dict[str, Any]] = None

class InventarisResponse(InventarisBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
