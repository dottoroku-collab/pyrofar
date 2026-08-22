import enum
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base

class KondisiBarang(str, enum.Enum):
    baik = "baik"
    rusak_ringan = "rusak_ringan"
    rusak_berat = "rusak_berat"

class TipeBarang(str, enum.Enum):
    equipment = "equipment"
    asset = "asset"
    consumable = "consumable"

class Inventaris(Base):
    __tablename__ = "inventaris"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    nama_barang = Column(String(200), nullable=False)
    kategori = Column(String(100), nullable=False)
    tipe_barang = Column(Enum(TipeBarang), nullable=False, default=TipeBarang.equipment)
    jumlah = Column(Integer, nullable=False, default=1)
    kondisi = Column(Enum(KondisiBarang), nullable=False, default=KondisiBarang.baik)
    metadata_tambahan = Column(JSONB, nullable=True)
    
    lokasi_id = Column(Integer, ForeignKey("lokasi.id"), nullable=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    lokasi = relationship("Lokasi")
    armada = relationship("Armada")
