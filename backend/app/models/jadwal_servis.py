import enum

from sqlalchemy import BigInteger, Column, Date, Enum, ForeignKey, Integer, String

from app.core.database import Base


class JenisReminder(str, enum.Enum):
    servis_berkala = "servis_berkala"
    ganti_oli = "ganti_oli"
    ganti_ban = "ganti_ban"
    perpanjangan_stnk = "perpanjangan_stnk"


class JadwalServis(Base):
    __tablename__ = "jadwal_servis"

    id = Column(BigInteger, primary_key=True, index=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=False, index=True)
    jenis_reminder = Column(Enum(JenisReminder, name="jenis_reminder_enum"), nullable=False)
    tanggal_jatuh_tempo = Column(Date, nullable=False)
    ambang_hari_reminder = Column(Integer, nullable=False, default=30)
    status = Column(String(30), nullable=False, default="aktif")
