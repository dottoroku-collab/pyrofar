import enum

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class StatusPemeliharaan(str, enum.Enum):
    proses = "proses"
    selesai = "selesai"


class Pemeliharaan(Base):
    __tablename__ = "pemeliharaan"

    id = Column(BigInteger, primary_key=True, index=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=False, index=True)
    tanggal = Column(Date, nullable=False)
    jenis_kendala = Column(String(150), nullable=True)
    kategori = Column(String(100), nullable=True)
    jenis_pekerjaan = Column(String(150), nullable=True)
    nama_montir = Column(String(150), nullable=True)
    vendor = Column(String(150), nullable=True)
    biaya = Column(Numeric(14, 2), nullable=False, default=0)
    jumlah = Column(Integer, nullable=False, default=1)
    foto_sebelum_url = Column(String(500), nullable=True)
    foto_sesudah_url = Column(String(500), nullable=True)
    status = Column(
        Enum(StatusPemeliharaan, name="status_pemeliharaan_enum"),
        nullable=False,
        default=StatusPemeliharaan.proses,
    )
    keterangan = Column(Text, nullable=True)
    input_oleh = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    tanggal_input = Column(DateTime(timezone=True), server_default=func.now())
    is_deleted = Column(Boolean, nullable=False, default=False)

    sparepart = relationship("Sparepart", back_populates="pemeliharaan", cascade="all, delete-orphan")
