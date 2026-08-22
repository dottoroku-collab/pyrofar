import enum
from sqlalchemy import Column, String, ForeignKey, BigInteger, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base

class JabatanPersonil(str, enum.Enum):
    danki = "danki"
    danton = "danton"
    danru = "danru"
    operator = "operator"
    lainnya = "lainnya"

class Personil(Base):
    __tablename__ = "personil"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), unique=True, nullable=False)
    nip_nik = Column(String(50), unique=True, nullable=False, index=True)
    jabatan = Column(Enum(JabatanPersonil, name="jabatan_personil"), nullable=False, default=JabatanPersonil.operator)
    regu_id = Column(BigInteger, ForeignKey("regu.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="personil")
    regu = relationship("Regu", back_populates="personils")

    @property
    def nama_lengkap(self):
        return self.user.nama if self.user else ""

    @property
    def is_active(self):
        return self.user.is_active if self.user else True

    @property
    def no_hp(self):
        return None

    @property
    def foto_url(self):
        return None
