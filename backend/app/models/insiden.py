import enum
from sqlalchemy import Column, String, Integer, BigInteger, Text, DateTime, ForeignKey, Enum, Table, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base

class JenisInsiden(str, enum.Enum):
    pemadaman = "pemadaman"
    penyelamatan = "penyelamatan"

class StatusInsiden(str, enum.Enum):
    menunggu = "menunggu"
    berangkat = "berangkat"
    penanganan = "penanganan"
    selesai = "selesai"
    batal = "batal"

insiden_armada = Table(
    "insiden_armada",
    Base.metadata,
    Column("insiden_id", UUID(as_uuid=True), ForeignKey("insiden.id", ondelete="CASCADE"), primary_key=True),
    Column("armada_id", BigInteger, ForeignKey("armada.id", ondelete="CASCADE"), primary_key=True),
    Column("waktu_dispatch", DateTime(timezone=True), server_default=func.now()),
)

class Insiden(Base):
    __tablename__ = "insiden"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    jenis_insiden = Column(Enum(JenisInsiden), nullable=False)
    kategori = Column(String(100), nullable=False)
    objek = Column(String(200), nullable=False)
    alamat = Column(Text, nullable=False)
    pelapor_nama = Column(String(100), nullable=False)
    pelapor_kontak = Column(String(50), nullable=False)
    pelapor_alamat = Column(Text, nullable=True)
    jumlah_terdampak = Column(Integer, nullable=True)
    
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    
    # Dampak Pasca-Penanganan
    luas_areal = Column(Integer, nullable=True)
    korban_meninggal = Column(Integer, nullable=True)
    korban_luka = Column(Integer, nullable=True)
    korban_kk = Column(Integer, nullable=True)
    taksiran_kerugian = Column(BigInteger, nullable=True)
    
    waktu_lapor = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    waktu_berangkat = Column(DateTime(timezone=True), nullable=True)
    waktu_tiba = Column(DateTime(timezone=True), nullable=True)
    waktu_selesai = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=True)
    
    status = Column(Enum(StatusInsiden), nullable=False, default=StatusInsiden.menunggu)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    armadas = relationship("Armada", secondary=insiden_armada, backref="insidens")
    regus = relationship("Regu", secondary="insiden_regu", backref="insidens")

insiden_regu = Table(
    "insiden_regu",
    Base.metadata,
    Column("insiden_id", UUID(as_uuid=True), ForeignKey("insiden.id", ondelete="CASCADE"), primary_key=True),
    Column("regu_id", BigInteger, ForeignKey("regu.id", ondelete="CASCADE"), primary_key=True),
    Column("waktu_dispatch", DateTime(timezone=True), server_default=func.now()),
)
