from sqlalchemy import BigInteger, Boolean, Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Sparepart(Base):
    __tablename__ = "sparepart"

    id = Column(BigInteger, primary_key=True, index=True)
    pemeliharaan_id = Column(BigInteger, ForeignKey("pemeliharaan.id"), nullable=False, index=True)
    nama_sparepart = Column(String(150), nullable=False)
    merk = Column(String(100), nullable=True)
    jumlah = Column(Integer, nullable=False, default=1)
    harga = Column(Numeric(14, 2), nullable=False, default=0)
    tanggal_penggantian = Column(Date, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)

    pemeliharaan = relationship("Pemeliharaan", back_populates="sparepart")
