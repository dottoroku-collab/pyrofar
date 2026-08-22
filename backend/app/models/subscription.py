import enum
from uuid import uuid4
from sqlalchemy import Column, String, Text, ForeignKey, Integer, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    unpaid = "unpaid"


class Plan(Base):
    __tablename__ = "plans"

    code = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    max_users = Column(Integer, nullable=True)
    max_armada = Column(Integer, nullable=True)
    features = Column(Text, nullable=False, default="[]")  # JSON encoded list of features
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("tenants.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    plan_code = Column(String(50), ForeignKey("plans.code"), nullable=False)
    status = Column(Enum(SubscriptionStatus, name="subscription_status_enum"), nullable=False, default=SubscriptionStatus.active)
    
    start_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
