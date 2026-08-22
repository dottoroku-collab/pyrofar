from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, List, Dict
from uuid import UUID
from datetime import date, datetime
from app.models.inspeksi import StatusKepatuhan, StatusInspeksi, StatusApproval

class InspeksiBase(BaseModel):
    objek_inspeksi: str
    building_name: Optional[str] = None
    owner_name: Optional[str] = None
    alamat: str
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    tanggal_inspeksi: date
    status: Optional[StatusInspeksi] = StatusInspeksi.pending
    status_kepatuhan: Optional[StatusKepatuhan] = StatusKepatuhan.patuh
    catatan: Optional[str] = None
    recommendations: Optional[str] = None
    approval_status: Optional[StatusApproval] = StatusApproval.pending
    approved_by_id: Optional[int] = None
    checklist: Optional[Any] = None
    findings: Optional[Any] = None
    photos: Optional[Any] = None
    documents: Optional[Any] = None

class InspeksiCreate(InspeksiBase):
    pass

class InspeksiUpdate(BaseModel):
    objek_inspeksi: Optional[str] = None
    building_name: Optional[str] = None
    owner_name: Optional[str] = None
    alamat: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    tanggal_inspeksi: Optional[date] = None
    status: Optional[StatusInspeksi] = None
    status_kepatuhan: Optional[StatusKepatuhan] = None
    catatan: Optional[str] = None
    recommendations: Optional[str] = None
    approval_status: Optional[StatusApproval] = None
    approved_by_id: Optional[int] = None
    checklist: Optional[Any] = None
    findings: Optional[Any] = None
    photos: Optional[Any] = None
    documents: Optional[Any] = None

class InspeksiResponse(InspeksiBase):
    id: UUID
    tenant_id: UUID
    inspektur_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
