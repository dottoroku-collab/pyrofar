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
    SmallInteger,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class StatusArmada(str, enum.Enum):
    standby = "standby"
    sedang_bertugas = "sedang_bertugas"
    pemeliharaan = "pemeliharaan"
    menunggu_sparepart = "menunggu_sparepart"
    rusak_ringan = "rusak_ringan"
    rusak_berat = "rusak_berat"
    tidak_aktif = "tidak_aktif"
    menunggu_approval = "menunggu_approval"


class ApprovalStatus(str, enum.Enum):
    tidak_perlu = "tidak_perlu"
    pending = "pending"
    disetujui = "disetujui"
    ditolak = "ditolak"


class Armada(Base):
    __tablename__ = "armada"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    kode_armada = Column(String(50), nullable=False, index=True)
    nama_armada = Column(String(150), nullable=True)
    jenis_kendaraan_id = Column(Integer, ForeignKey("jenis_kendaraan.id"), nullable=False)
    merk = Column(String(100), nullable=True)
    type = Column(String(100), nullable=True)
    tahun = Column(SmallInteger, nullable=True)
    no_polisi = Column(String(20), nullable=True, index=True)
    no_lambung = Column(String(50), nullable=True, index=True)
    no_mesin = Column(String(100), nullable=True)
    no_rangka = Column(String(100), nullable=True)
    no_bpkb = Column(String(100), nullable=True)
    tanggal_stnk = Column(Date, nullable=True)
    kapasitas = Column(String(50), nullable=True)
    status_kepemilikan = Column(String(100), nullable=True)
    qr_code_value = Column(String(100), nullable=False, index=True)
    status_armada = Column(
        Enum(StatusArmada, name="status_armada_enum"), nullable=False, default=StatusArmada.standby
    )
    status_approval = Column(
        Enum(ApprovalStatus, name="approval_status_enum"),
        nullable=False,
        default=ApprovalStatus.tidak_perlu,
    )
    lokasi_saat_ini_id = Column(Integer, ForeignKey("lokasi.id"), nullable=True)
    driver_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, nullable=False, default=False)

    jenis_kendaraan = relationship("JenisKendaraan")
    lokasi = relationship("Lokasi")
    files = relationship("ArmadaFile", back_populates="armada", cascade="all, delete-orphan")
    driver = relationship("User", foreign_keys=[driver_id])

    @property
    def driver_name(self) -> str | None:
        return self.driver.nama if self.driver else None
