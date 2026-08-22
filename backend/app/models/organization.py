from uuid import uuid4
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrganizationUnit(Base):
    __tablename__ = "organization_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("tenants.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    parent_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("organization_units.id", ondelete="SET NULL"), 
        nullable=True
    )
    
    name = Column(String(150), nullable=False)
    unit_type = Column(String(50), nullable=False)  # e.g., 'DINAS', 'BIDANG', 'UPT', 'POSKO'
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Self-referential relationship for hierarchy
    parent = relationship("OrganizationUnit", remote_side=[id], backref="children")
