from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import datetime
import enum

from app.core.database import Base

class EdukasiKategori(str, enum.Enum):
    sosialisasi_masyarakat = "sosialisasi_masyarakat"
    kunjungan_sekolah = "kunjungan_sekolah"
    pelatihan = "pelatihan"
    lainnya = "lainnya"

class EdukasiStatus(str, enum.Enum):
    scheduled = "scheduled"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class Edukasi(Base):
    __tablename__ = "edukasi"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    kategori = Column(Enum(EdukasiKategori), nullable=False)
    judul_kegiatan = Column(String(255), nullable=False)
    tanggal_pelaksanaan = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    lokasi = Column(String(255), nullable=False)
    target_audiens = Column(String(255), nullable=True)
    jumlah_peserta = Column(Integer, nullable=True, default=0)
    
    status = Column(Enum(EdukasiStatus), nullable=False, default=EdukasiStatus.scheduled)
    deskripsi = Column(Text, nullable=True)
    
    # Store photos, documents, attachments
    dokumentasi = Column(JSONB, nullable=True, default=[])
    
    # relationships
    tenant = relationship("Tenant")
