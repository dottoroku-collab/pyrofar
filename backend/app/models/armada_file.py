import enum

from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class JenisFileArmada(str, enum.Enum):
    stnk = "stnk"
    bpkb = "bpkb"
    foto_depan = "foto_depan"
    foto_belakang = "foto_belakang"
    foto_kanan = "foto_kanan"
    foto_kiri = "foto_kiri"
    foto_interior = "foto_interior"


class ArmadaFile(Base):
    __tablename__ = "armada_file"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=False, index=True)
    jenis_file = Column(Enum(JenisFileArmada, name="jenis_file_armada_enum"), nullable=False)
    file_url = Column(String(500), nullable=False)
    uploaded_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    armada = relationship("Armada", back_populates="files")
