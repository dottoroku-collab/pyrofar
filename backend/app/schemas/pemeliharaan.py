from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.pemeliharaan import StatusPemeliharaan


class SparepartBase(BaseModel):
    nama_sparepart: str
    merk: str | None = None
    jumlah: int = 1
    harga: Decimal = Decimal("0")
    tanggal_penggantian: date | None = None


class SparepartCreate(SparepartBase):
    pass


class SparepartPublic(SparepartBase):
    id: int
    pemeliharaan_id: int

    class Config:
        from_attributes = True


class PemeliharaanBase(BaseModel):
    armada_id: int
    tanggal: date
    jenis_kendala: str | None = None
    kategori: str | None = None
    jenis_pekerjaan: str | None = None
    nama_montir: str | None = None
    vendor: str | None = None
    biaya: Decimal = Decimal("0")
    jumlah: int = 1
    keterangan: str | None = None


class PemeliharaanCreate(PemeliharaanBase):
    sparepart: list[SparepartCreate] = []


class PemeliharaanUpdate(BaseModel):
    jenis_kendala: str | None = None
    kategori: str | None = None
    jenis_pekerjaan: str | None = None
    nama_montir: str | None = None
    vendor: str | None = None
    biaya: Decimal | None = None
    jumlah: int | None = None
    keterangan: str | None = None
    status: StatusPemeliharaan | None = None


class PemeliharaanPublic(PemeliharaanBase):
    id: int
    foto_sebelum_url: str | None = None
    foto_sesudah_url: str | None = None
    status: StatusPemeliharaan
    input_oleh: int | None = None
    tanggal_input: datetime
    sparepart: list[SparepartPublic] = []

    class Config:
        from_attributes = True
