from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from app.core.database import Base


class Lokasi(Base):
    __tablename__ = "lokasi"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
