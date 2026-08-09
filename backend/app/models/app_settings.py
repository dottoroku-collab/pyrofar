from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.core.database import Base


class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(Integer, primary_key=True)

    app_name = Column(
        String(150),
        nullable=False,
        default="SIM Armada Damkar",
    )

    app_short_name = Column(
        String(50),
        nullable=False,
        default="SIM Armada",
    )

    organization_name = Column(
        String(200),
        nullable=True,
    )

    region_name = Column(
        String(150),
        nullable=True,
    )

    logo_url = Column(
        String(500),
        nullable=True,
    )

    primary_color = Column(
        String(20),
        nullable=False,
        default="#C62828",
    )

    secondary_color = Column(
        String(20),
        nullable=False,
        default="#263238",
    )

    contact_email = Column(
        String(150),
        nullable=True,
    )

    contact_phone = Column(
        String(50),
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        onupdate=func.now(),
    )