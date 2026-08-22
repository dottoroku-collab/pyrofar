from datetime import datetime
from uuid import UUID as PythonUUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class License(Base):
    __tablename__ = "licenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    tenant_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id"),
        nullable=False,
        index=True,
    )

    license_key: Mapped[str] = mapped_column(
        String(2048),
        unique=True,
        nullable=False,
        index=True,
    )

    license_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    plan_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    plan_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    organization_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    issued_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    max_users: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    max_armada: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    features: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="[]",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    activated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )