import enum
from sqlalchemy import Column, String, BigInteger, Text, DateTime, Date, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base

class StatusKepatuhan(str, enum.Enum):
    patuh = "patuh"
    sebagian = "sebagian"
    tidak_patuh = "tidak_patuh"

class StatusInspeksi(str, enum.Enum):
    pending = "pending"
    ongoing = "ongoing"
    completed = "completed"
    followed_up = "followed_up"

class StatusApproval(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class InspeksiProteksi(Base):
    __tablename__ = "inspeksi_proteksi"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Building Info
    objek_inspeksi = Column(String(200), nullable=False)
    building_name = Column(String(200), nullable=True)
    owner_name = Column(String(200), nullable=True)
    alamat = Column(Text, nullable=False)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    
    # Inspection Info
    tanggal_inspeksi = Column(Date, nullable=False)
    status = Column(Enum(StatusInspeksi, name="status_inspeksi_enum"), nullable=False, default=StatusInspeksi.pending)
    status_kepatuhan = Column(Enum(StatusKepatuhan, name="status_kepatuhan_enum"), nullable=False, default=StatusKepatuhan.patuh)
    catatan = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Inspector & Approval
    inspektur_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    approval_status = Column(Enum(StatusApproval, name="status_approval_enum"), nullable=False, default=StatusApproval.pending)
    approved_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    
    # JSONB Flexible Data
    checklist = Column(JSONB, nullable=True)
    findings = Column(JSONB, nullable=True)
    photos = Column(JSONB, nullable=True)
    documents = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    inspektur = relationship("User", foreign_keys=[inspektur_id])
    approver = relationship("User", foreign_keys=[approved_by_id])
