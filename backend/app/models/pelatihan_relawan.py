import uuid
from sqlalchemy import Column, String, Integer, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class PelatihanRelawan(Base):
    __tablename__ = "pelatihan_relawan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    nama = Column(String, nullable=False)
    tanggal = Column(Date, nullable=False)
    kapasitas = Column(Integer, nullable=False)
    peserta_terdaftar = Column(Integer, default=0)
    status = Column(String, default="upcoming")
    lokasi = Column(String, nullable=True)
    deskripsi = Column(Text, nullable=True)
