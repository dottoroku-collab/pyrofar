from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from app.models.personil import JabatanPersonil

class KompiBase(BaseModel):
    nama: str
    deskripsi: Optional[str] = None

class KompiCreate(KompiBase):
    pass

class KompiUpdate(BaseModel):
    nama: Optional[str] = None
    deskripsi: Optional[str] = None

class KompiResponse(KompiBase):
    id: int
    tenant_id: Any
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PletonBase(BaseModel):
    kompi_id: int
    nama: str
    deskripsi: Optional[str] = None

class PletonCreate(PletonBase):
    pass

class PletonUpdate(BaseModel):
    kompi_id: Optional[int] = None
    nama: Optional[str] = None
    deskripsi: Optional[str] = None

class PletonResponse(PletonBase):
    id: int
    tenant_id: Any
    kompi: Optional[KompiResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ReguBase(BaseModel):
    pleton_id: int
    station_id: Optional[int] = None
    nama: str
    deskripsi: Optional[str] = None

class ReguCreate(ReguBase):
    pass

class ReguUpdate(BaseModel):
    pleton_id: Optional[int] = None
    station_id: Optional[int] = None
    nama: Optional[str] = None
    deskripsi: Optional[str] = None

class ReguResponse(ReguBase):
    id: int
    tenant_id: Any
    pleton: Optional[PletonResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PersonilBase(BaseModel):
    user_id: Optional[int] = None
    regu_id: Optional[int] = None
    nip_nik: str
    nama_lengkap: str
    jabatan: JabatanPersonil
    no_hp: Optional[str] = None
    foto_url: Optional[str] = None
    is_active: bool = True

class PersonilCreate(PersonilBase):
    email: Optional[str] = None
    password: Optional[str] = None  # Will default to nip_nik if not provided

class PersonilUpdate(BaseModel):
    regu_id: Optional[int] = None
    nip_nik: Optional[str] = None
    nama_lengkap: Optional[str] = None
    jabatan: Optional[JabatanPersonil] = None
    no_hp: Optional[str] = None
    foto_url: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None
    password: Optional[str] = None

class PersonilResponse(PersonilBase):
    id: int
    tenant_id: Any
    regu: Optional[ReguResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
