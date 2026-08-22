import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class KomunitasRelawan(Base):
    __tablename__ = "komunitas_relawan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    nama = Column(String, nullable=False)
    lokasi = Column(String, nullable=False)
    jumlah_anggota = Column(Integer, default=0)
    status = Column(String, default="active")
    kontak_utama = Column(String, nullable=True)
    nomor_telepon = Column(String, nullable=True)
