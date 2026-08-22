"""Personnel real-time location tracking model."""
from sqlalchemy import BigInteger, Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class PersonnelTracking(Base):
    __tablename__ = "personnel_tracking"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One row per user (UPSERT strategy)
        index=True,
    )
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy_m = Column(Float, nullable=True)
    speed_kmh = Column(Float, nullable=True)
    heading = Column(Float, nullable=True)
    battery_pct = Column(Integer, nullable=True)
    personnel_status = Column(
        String(20),
        nullable=False,
        default="standby",
        server_default="standby",
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", lazy="joined")

