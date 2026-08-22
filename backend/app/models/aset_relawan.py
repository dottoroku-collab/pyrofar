from sqlalchemy import Column, String, Float, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from app.core.database import Base

class TipeAsetRelawan(str, enum.Enum):
    fire_boat = "fire_boat"
    fire_pump = "fire_pump"
    posko = "posko"
    pulau = "pulau"

class StatusAsetRelawan(str, enum.Enum):
    ready = "ready"
    maintenance = "maintenance"
    deployed = "deployed"

class AsetRelawan(Base):
    __tablename__ = "aset_relawan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    tipe = Column(Enum(TipeAsetRelawan), nullable=False)
    nama = Column(String(255), nullable=False)
    kapasitas = Column(String(100), nullable=True)
    
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    
    status = Column(Enum(StatusAsetRelawan), nullable=False, default=StatusAsetRelawan.ready)
