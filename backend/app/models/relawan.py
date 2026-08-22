from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class StatusRelawan(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    in_mission = "in_mission"

class Relawan(Base):
    __tablename__ = "relawan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    
    nama = Column(String(255), nullable=False)
    nik = Column(String(50), nullable=True)
    no_telepon = Column(String(50), nullable=True)
    alamat = Column(String(500), nullable=True)
    
    provinsi = Column(String(100), nullable=True)
    kota = Column(String(100), nullable=True)
    kecamatan = Column(String(100), nullable=True)
    kelurahan = Column(String(100), nullable=True)
    
    pekerjaan = Column(String(100), nullable=True)
    pendidikan = Column(String(100), nullable=True)
    golongan_darah = Column(String(5), nullable=True)
    
    foto_ktp = Column(String, nullable=True)
    foto_diri = Column(String, nullable=True)

    komunitas = Column(String(255), nullable=True)
    biodata = Column(JSONB, nullable=True, default={})
    skills = Column(JSONB, nullable=True, default=[])
    trainings = Column(JSONB, nullable=True, default=[])
    certifications = Column(JSONB, nullable=True, default=[])
    activity_history = Column(JSONB, nullable=True, default=[])
    incident_participation = Column(JSONB, nullable=True, default=[])
    
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    status = Column(Enum(StatusRelawan), nullable=False, default=StatusRelawan.active)
