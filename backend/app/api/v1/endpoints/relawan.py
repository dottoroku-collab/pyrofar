from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.relawan import Relawan
from app.models.aset_relawan import AsetRelawan
from app.schemas.relawan import (
    RelawanCreate, RelawanUpdate, RelawanResponse,
    AsetRelawanCreate, AsetRelawanUpdate, AsetRelawanResponse,
    RelawanDashboardResponse,
    KomunitasRelawanCreate, KomunitasRelawanUpdate, KomunitasRelawanResponse,
    PelatihanRelawanCreate, PelatihanRelawanUpdate, PelatihanRelawanResponse,
    InsidenRelawanCreate, InsidenRelawanUpdate, InsidenRelawanResponse
)
from app.services import relawan_service

router = APIRouter(prefix="/relawan", tags=["Relawan"])

@router.get("/kondisi", response_model=Dict[str, Any])
def get_kondisi_lingkungan(
    lat: float,
    lon: float,
    current_user: User = Depends(get_current_user)
):
    """
    Get mocked environmental conditions (weather, tide, water sources)
    """
    return relawan_service.fetch_mock_relawan_data(lat, lon)

@router.get("/dashboard", response_model=RelawanDashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get KPI and spatial data for Relawan Dashboard
    """
    relawans = db.query(Relawan).filter(Relawan.tenant_id == current_user.tenant_id).all()
    aset_relawan = db.query(AsetRelawan).filter(AsetRelawan.tenant_id == current_user.tenant_id).all()
    
    # KPIs
    active_volunteers = len([r for r in relawans if r.status == 'active'])
    trained_volunteers = len([r for r in relawans if len(r.trainings or []) > 0])
    communities = len(set([r.komunitas for r in relawans if r.komunitas]))
    
    # Mock other KPIs
    incidents_reported = 12
    average_response = "15 mins"
    simulation_count = 4
    
    # Format data for map (merging relawan with assets)
    spatial_data = []
    
    # Map Relawans
    for r in relawans:
        if r.latitude and r.longitude:
            try:
                spatial_data.append({
                    "id": str(r.id),
                    "type": "relawan",
                    "name": r.nama,
                    "lat": float(r.latitude),
                    "lng": float(r.longitude)
                })
            except ValueError:
                pass
            
    # Map Aset Relawan (Posko, Fire Boat, Fire Pump, Pulau)
    for a in aset_relawan:
        if a.latitude and a.longitude:
            try:
                spatial_data.append({
                    "id": str(a.id),
                    "type": a.tipe.value,
                    "name": a.nama,
                    "lat": float(a.latitude),
                    "lng": float(a.longitude)
                })
            except ValueError:
                pass
            
    # Add some mock incidents for visual
    spatial_data.extend([
        {"id": "i1", "type": "incident", "name": "Kapal Terbakar", "lat": -6.095, "lng": 106.80}
    ])
    
    return {
        "kpi": {
            "active_volunteers": active_volunteers,
            "trained_volunteers": trained_volunteers,
            "communities": communities,
            "incidents_reported": incidents_reported,
            "average_response": average_response,
            "simulation_count": simulation_count
        },
        "map_data": {
            "markers": spatial_data
        }
    }

# ============================
# Relawan Endpoints
# ============================

@router.get("/relawan", response_model=List[RelawanResponse])
def get_relawans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Relawan).filter(Relawan.tenant_id == current_user.tenant_id).all()

@router.post("/relawan", response_model=RelawanResponse)
def create_relawan(data: RelawanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = Relawan(tenant_id=current_user.tenant_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/relawan/{id}", response_model=RelawanResponse)
def get_relawan(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Relawan).filter(Relawan.id == id, Relawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    return item

@router.put("/relawan/{id}", response_model=RelawanResponse)
def update_relawan(id: UUID, data: RelawanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Relawan).filter(Relawan.id == id, Relawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(item, k, v)
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/relawan/{id}")
def delete_relawan(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Relawan).filter(Relawan.id == id, Relawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    db.delete(item)
    db.commit()
    return {"message": "Relawan berhasil dihapus"}

# ============================
# Aset Relawan Endpoints
# ============================

@router.get("/aset-relawan", response_model=List[AsetRelawanResponse])
def get_aset_relawan(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AsetRelawan).filter(AsetRelawan.tenant_id == current_user.tenant_id).all()

@router.post("/aset-relawan", response_model=AsetRelawanResponse)
def create_aset_relawan(data: AsetRelawanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = AsetRelawan(tenant_id=current_user.tenant_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/aset-relawan/{id}", response_model=AsetRelawanResponse)
def get_aset_relawan_by_id(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(AsetRelawan).filter(AsetRelawan.id == id, AsetRelawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    return item

@router.put("/aset-relawan/{id}", response_model=AsetRelawanResponse)
def update_aset_relawan(id: UUID, data: AsetRelawanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(AsetRelawan).filter(AsetRelawan.id == id, AsetRelawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(item, k, v)
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/aset-relawan/{id}")
def delete_aset_relawan(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(AsetRelawan).filter(AsetRelawan.id == id, AsetRelawan.tenant_id == current_user.tenant_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    db.delete(item)
    db.commit()
    return {"message": "Aset Relawan berhasil dihapus"}

# ============================
# Komunitas Relawan Endpoints
# ============================

@router.get("/komunitas", response_model=List[KomunitasRelawanResponse])
def get_komunitas_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.list_komunitas(db, current_user.tenant_id, skip, limit)

@router.post("/komunitas", response_model=KomunitasRelawanResponse)
def create_komunitas(data: KomunitasRelawanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.create_komunitas(db, current_user.tenant_id, data)

@router.put("/komunitas/{id}", response_model=KomunitasRelawanResponse)
def update_komunitas(id: UUID, data: KomunitasRelawanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.update_komunitas(db, current_user.tenant_id, id, data)

@router.delete("/komunitas/{id}")
def delete_komunitas(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relawan_service.delete_komunitas(db, current_user.tenant_id, id)
    return {"message": "Komunitas berhasil dihapus"}

# ============================
# Pelatihan Relawan Endpoints
# ============================

@router.get("/pelatihan", response_model=List[PelatihanRelawanResponse])
def get_pelatihan_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.list_pelatihan(db, current_user.tenant_id, skip, limit)

@router.post("/pelatihan", response_model=PelatihanRelawanResponse)
def create_pelatihan(data: PelatihanRelawanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.create_pelatihan(db, current_user.tenant_id, data)

@router.put("/pelatihan/{id}", response_model=PelatihanRelawanResponse)
def update_pelatihan(id: UUID, data: PelatihanRelawanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.update_pelatihan(db, current_user.tenant_id, id, data)

@router.delete("/pelatihan/{id}")
def delete_pelatihan(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relawan_service.delete_pelatihan(db, current_user.tenant_id, id)
    return {"message": "Pelatihan berhasil dihapus"}

# ============================
# Insiden Relawan Endpoints
# ============================

@router.get("/insiden", response_model=List[InsidenRelawanResponse])
def get_insiden_relawan_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.list_insiden_relawan(db, current_user.tenant_id, skip, limit)

@router.post("/insiden", response_model=InsidenRelawanResponse)
def create_insiden_relawan(data: InsidenRelawanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.create_insiden_relawan(db, current_user.tenant_id, data)

@router.put("/insiden/{id}", response_model=InsidenRelawanResponse)
def update_insiden_relawan(id: UUID, data: InsidenRelawanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return relawan_service.update_insiden_relawan(db, current_user.tenant_id, id, data)

@router.delete("/insiden/{id}")
def delete_insiden_relawan(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    relawan_service.delete_insiden_relawan(db, current_user.tenant_id, id)
    return {"message": "Insiden berhasil dihapus"}
