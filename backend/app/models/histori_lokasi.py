from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class HistoriLokasi(Base):
    __tablename__ = "histori_lokasi"

    id = Column(BigInteger, primary_key=True, index=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=False, index=True)
    lokasi_lama_id = Column(Integer, ForeignKey("lokasi.id"), nullable=True)
    lokasi_baru_id = Column(Integer, ForeignKey("lokasi.id"), nullable=False)
    tanggal_pindah = Column(Date, nullable=False, server_default=func.current_date())
    dipindahkan_oleh = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    keterangan = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lokasi_lama = relationship("Lokasi", foreign_keys=[lokasi_lama_id])
    lokasi_baru = relationship("Lokasi", foreign_keys=[lokasi_baru_id])
