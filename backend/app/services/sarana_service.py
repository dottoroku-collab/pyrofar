from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from fastapi import HTTPException, status
from app.models.inventaris import Inventaris, TipeBarang
from app.schemas.inventaris import InventarisCreate, InventarisUpdate

def get_inventaris(db: Session, tenant_id: UUID, inventaris_id: UUID) -> Inventaris:
    inventaris = db.query(Inventaris).filter(
        Inventaris.id == inventaris_id,
        Inventaris.tenant_id == tenant_id
    ).first()
    if not inventaris:
        raise HTTPException(status_code=404, detail="Inventaris not found")
    return inventaris

def list_inventaris(db: Session, tenant_id: UUID, tipe_barang: Optional[TipeBarang] = None, skip: int = 0, limit: int = 100):
    query = db.query(Inventaris).filter(Inventaris.tenant_id == tenant_id)
    if tipe_barang:
        query = query.filter(Inventaris.tipe_barang == tipe_barang)
    return query.offset(skip).limit(limit).all()

def create_inventaris(db: Session, tenant_id: UUID, inventaris_in: InventarisCreate) -> Inventaris:
    db_inventaris = Inventaris(
        tenant_id=tenant_id,
        nama_barang=inventaris_in.nama_barang,
        kategori=inventaris_in.kategori,
        tipe_barang=inventaris_in.tipe_barang,
        jumlah=inventaris_in.jumlah,
        kondisi=inventaris_in.kondisi,
        lokasi_id=inventaris_in.lokasi_id,
        armada_id=inventaris_in.armada_id,
        metadata_tambahan=inventaris_in.metadata_tambahan
    )
    db.add(db_inventaris)
    db.commit()
    db.refresh(db_inventaris)
    return db_inventaris

def update_inventaris(db: Session, tenant_id: UUID, inventaris_id: UUID, inventaris_in: InventarisUpdate) -> Inventaris:
    db_inventaris = get_inventaris(db, tenant_id, inventaris_id)
    
    update_data = inventaris_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_inventaris, field, value)
        
    db.commit()
    db.refresh(db_inventaris)
    return db_inventaris
