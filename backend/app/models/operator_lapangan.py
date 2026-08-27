from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class OperatorLapangan(Base):
    __tablename__ = "operator_lapangan"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    nip_nik = Column(String(50), unique=True, nullable=False, index=True)
    foto_url = Column(String(2048), nullable=True)
    sim_file_url = Column(String(2048), nullable=True)
    sim_expiry_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="operator_profile", cascade="all, delete")
