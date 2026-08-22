from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status
from app.models.inspeksi import InspeksiProteksi
from app.schemas.inspeksi import InspeksiCreate, InspeksiUpdate

def get_inspeksi(db: Session, tenant_id: UUID, inspeksi_id: UUID) -> InspeksiProteksi:
    inspeksi = db.query(InspeksiProteksi).filter(
        InspeksiProteksi.id == inspeksi_id,
        InspeksiProteksi.tenant_id == tenant_id
    ).first()
    if not inspeksi:
        raise HTTPException(status_code=404, detail="Inspeksi not found")
    return inspeksi

def list_inspeksi(db: Session, tenant_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(InspeksiProteksi).filter(InspeksiProteksi.tenant_id == tenant_id).offset(skip).limit(limit).all()

def create_inspeksi(db: Session, tenant_id: UUID, user_id: int, inspeksi_in: InspeksiCreate) -> InspeksiProteksi:
    db_inspeksi = InspeksiProteksi(
        tenant_id=tenant_id,
        inspektur_id=user_id,
        **inspeksi_in.model_dump()
    )
    db.add(db_inspeksi)
    db.commit()
    db.refresh(db_inspeksi)
    return db_inspeksi

def update_inspeksi(db: Session, tenant_id: UUID, inspeksi_id: UUID, inspeksi_in: InspeksiUpdate) -> InspeksiProteksi:
    db_inspeksi = get_inspeksi(db, tenant_id, inspeksi_id)
    update_data = inspeksi_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_inspeksi, key, value)
    db.commit()
    db.refresh(db_inspeksi)
    return db_inspeksi
