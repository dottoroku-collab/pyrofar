import uuid
from sqlalchemy import Column, String, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class Kompi(Base):
    __tablename__ = "kompi"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    nama = Column(String(100), nullable=False)
    kode = Column(String(50), nullable=True)
    deskripsi = Column(String, nullable=True)

    # Relationships
    pletons = relationship("Pleton", back_populates="kompi")

class Pleton(Base):
    __tablename__ = "pleton"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    kompi_id = Column(BigInteger, ForeignKey("kompi.id"), nullable=False)
    nama = Column(String(100), nullable=False)
    kode = Column(String(50), nullable=True)
    deskripsi = Column(String, nullable=True)

    # Relationships
    kompi = relationship("Kompi", back_populates="pletons")
    regus = relationship("Regu", back_populates="pleton")

class Regu(Base):
    __tablename__ = "regu"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    pleton_id = Column(BigInteger, ForeignKey("pleton.id"), nullable=False)
    station_id = Column(UUID(as_uuid=True), ForeignKey("stations.id"), nullable=True) # Bisa null kalau regu tidak ditempatkan di posko luar
    nama = Column(String(100), nullable=False)
    kode = Column(String(50), nullable=True)
    deskripsi = Column(String, nullable=True)

    # Relationships
    pleton = relationship("Pleton", back_populates="regus")
    station = relationship("Station", back_populates="regus")
    personils = relationship("Personil", back_populates="regu")
