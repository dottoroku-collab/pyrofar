from datetime import date, datetime

from pydantic import BaseModel

from app.models.armada import ApprovalStatus, StatusArmada


class ArmadaBase(BaseModel):
    kode_armada: str
    nama_armada: str | None = None
    jenis_kendaraan_id: int
    merk: str | None = None
    type: str | None = None
    tahun: int | None = None
    no_polisi: str | None = None
    no_lambung: str | None = None
    no_mesin: str | None = None
    no_rangka: str | None = None
    no_bpkb: str | None = None
    tanggal_stnk: date | None = None
    kapasitas: str | None = None
    status_kepemilikan: str | None = None
    lokasi_saat_ini_id: int | None = None
    driver_id: int | None = None


class ArmadaCreate(ArmadaBase):
    pass


class ArmadaUpdate(BaseModel):
    kode_armada: str | None = None
    nama_armada: str | None = None
    jenis_kendaraan_id: int | None = None
    merk: str | None = None
    type: str | None = None
    tahun: int | None = None
    no_polisi: str | None = None
    no_lambung: str | None = None
    no_mesin: str | None = None
    no_rangka: str | None = None
    no_bpkb: str | None = None
    tanggal_stnk: date | None = None
    kapasitas: str | None = None
    status_kepemilikan: str | None = None
    lokasi_saat_ini_id: int | None = None
    driver_id: int | None = None


class ArmadaPublic(ArmadaBase):
    id: int
    qr_code_value: str
    status_armada: StatusArmada
    status_approval: ApprovalStatus
    created_at: datetime
    driver_name: str | None = None
    operator_lapangan_id: int | None = None

    class Config:
        from_attributes = True


class ArmadaListItem(BaseModel):
    id: int
    kode_armada: str
    nama_armada: str | None = None
    jenis_kendaraan_id: int
    lokasi_saat_ini_id: int | None = None
    status_armada: StatusArmada
    no_polisi: str | None = None
    tanggal_stnk: date | None = None
    driver_id: int | None = None
    driver_name: str | None = None

    class Config:
        from_attributes = True
