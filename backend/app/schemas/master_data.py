from pydantic import BaseModel


class JenisKendaraanBase(BaseModel):
    nama: str
    deskripsi: str | None = None


class JenisKendaraanCreate(JenisKendaraanBase):
    pass


class JenisKendaraanUpdate(BaseModel):
    nama: str | None = None
    deskripsi: str | None = None


class JenisKendaraanPublic(JenisKendaraanBase):
    id: int

    class Config:
        from_attributes = True


class LokasiBase(BaseModel):
    nama: str
    deskripsi: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class LokasiCreate(LokasiBase):
    pass


class LokasiUpdate(BaseModel):
    nama: str | None = None
    deskripsi: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class LokasiPublic(LokasiBase):
    id: int

    class Config:
        from_attributes = True
