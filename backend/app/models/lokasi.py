from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Float, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Lokasi(Base):
    __tablename__ = "lokasi"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    nama = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
