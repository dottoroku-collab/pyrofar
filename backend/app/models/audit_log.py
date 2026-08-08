import enum

from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class AuditAksi(str, enum.Enum):
    login = "login"
    tambah = "tambah"
    edit = "edit"
    hapus = "hapus"
    pindah_lokasi = "pindah_lokasi"
    input_maintenance = "input_maintenance"
    approve = "approve"
    reject = "reject"


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    aksi = Column(Enum(AuditAksi, name="audit_aksi_enum"), nullable=False)
    entitas = Column(String(100), nullable=False, index=True)
    entitas_id = Column(BigInteger, nullable=True)
    nilai_sebelum = Column(JSONB, nullable=True)
    nilai_sesudah = Column(JSONB, nullable=True)
    waktu = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Catatan: TIDAK ada kolom is_deleted/updated_at — sesuai BR-08 (append-only,
    # tidak bisa diedit/dihapus siapa pun termasuk Admin).
