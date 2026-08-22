import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class InsidenRelawan(Base):
    __tablename__ = "insiden_relawan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    judul = Column(String, nullable=False)
    tanggal = Column(DateTime, nullable=False)
    lokasi = Column(String, nullable=False)
    skala = Column(String, default="kecil")
    status = Column(String, default="aktif")
    deskripsi = Column(Text, nullable=True)
    jumlah_korban = Column(Integer, nullable=True)
