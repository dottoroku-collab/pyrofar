import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, func
from sqlalchemy import BigInteger
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from sqlalchemy.orm import relationship
from .rbac import user_roles
import enum

class UserRole(str, enum.Enum):
    administrator = "administrator"
    pimpinan = "pimpinan"
    operator_cc = "operator_cc"
    operator_lapangan_damkar = "operator_lapangan_damkar"
    operator_lapangan_penyelamatan = "operator_lapangan_penyelamatan"
    operator_sarpras = "operator_sarpras"
    teknisi = "teknisi"
    operator_pencegahan = "operator_pencegahan"

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    nama = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True, index=True) # made nullable because personil might only have username
    username = Column(String(150), nullable=True, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.operator_cc)
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    personil = relationship("Personil", back_populates="user", uselist=False)
    is_superadmin = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
