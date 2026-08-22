from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class StationBase(BaseModel):
    nama: str
    alamat: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    kapasitas_personil: Optional[int] = None
    is_relawan_post: Optional[bool] = False

class StationCreate(StationBase):
    pass

class StationUpdate(BaseModel):
    nama: Optional[str] = None
    alamat: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    kapasitas_personil: Optional[int] = None
    is_relawan_post: Optional[bool] = None

class StationResponse(StationBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
