from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.edukasi import Edukasi
from app.schemas.edukasi import EdukasiCreate, EdukasiUpdate, EdukasiResponse
from app.models.user import User

router = APIRouter(prefix="/edukasi", tags=["Edukasi"])

@router.get("/", response_model=List[EdukasiResponse])
def get_edukasi(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Edukasi).filter(Edukasi.tenant_id == current_user.tenant_id).order_by(Edukasi.tanggal_pelaksanaan.desc()).all()
    return items

@router.post("/", response_model=EdukasiResponse)
def create_edukasi(
    data: EdukasiCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = Edukasi(
        tenant_id=current_user.tenant_id,
        **data.model_dump()
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{id}", response_model=EdukasiResponse)
def get_edukasi_by_id(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Edukasi).filter(Edukasi.id == id, Edukasi.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    return item

@router.put("/{id}", response_model=EdukasiResponse)
def update_edukasi(
    id: UUID,
    data: EdukasiUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Edukasi).filter(Edukasi.id == id, Edukasi.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(item, k, v)
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{id}")
def delete_edukasi(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Edukasi).filter(Edukasi.id == id, Edukasi.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    
    db.delete(item)
    db.commit()
    return {"message": "Data edukasi berhasil dihapus"}
