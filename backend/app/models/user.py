import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from sqlalchemy import BigInteger

from app.core.database import Base


class UserRole(str, enum.Enum):
    administrator = "administrator"
    pimpinan = "pimpinan"
    kabid = "kabid"
    operator = "operator"
    teknisi = "teknisi"


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    nama = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
