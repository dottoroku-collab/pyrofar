from sqlalchemy import BigInteger, Boolean, Column, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.armada import ApprovalStatus, StatusArmada


class HistoriStatus(Base):
    __tablename__ = "histori_status"

    id = Column(BigInteger, primary_key=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    armada_id = Column(BigInteger, ForeignKey("armada.id"), nullable=False, index=True)
    status_lama = Column(Enum(StatusArmada, name="status_armada_enum"), nullable=True)
    status_baru = Column(Enum(StatusArmada, name="status_armada_enum"), nullable=False)
    tanggal = Column(DateTime(timezone=True), server_default=func.now())
    diajukan_oleh = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    butuh_approval = Column(Boolean, nullable=False, default=False)
    approval_status = Column(
        Enum(ApprovalStatus, name="approval_status_enum"),
        nullable=False,
        default=ApprovalStatus.tidak_perlu,
    )
    disetujui_oleh = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    tanggal_approval = Column(DateTime(timezone=True), nullable=True)
    catatan_approval = Column(Text, nullable=True)
    keterangan = Column(Text, nullable=True)
