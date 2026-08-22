import random
from typing import Dict, Any, List

def fetch_mock_relawan_data(lat: float, lon: float) -> Dict[str, Any]:
    """
    Mock integration for API RELAWAN (Sistem Informasi Relawan / Lingkungan)
    Returns synthetic data about environmental conditions and water sources.
    """
    # Mock data generation based on rough location
    water_level = round(random.uniform(0.5, 3.2), 2)
    wind_speed = round(random.uniform(5.0, 25.0), 1)
    temperature = round(random.uniform(28.0, 35.0), 1)
    humidity = round(random.uniform(60.0, 95.0), 1)
    
    # Generate some nearby mock hydrants
    hydrants = []
    for i in range(1, 4):
        hydrants.append({
            "id": f"HYD-{random.randint(1000, 9999)}",
            "lat": lat + random.uniform(-0.01, 0.01),
            "lon": lon + random.uniform(-0.01, 0.01),
            "status": random.choice(["active", "active", "maintenance"]),
            "pressure_bar": round(random.uniform(3.0, 6.0), 1)
        })
        
    return {
        "location": {"lat": lat, "lon": lon},
        "weather": {
            "temperature_c": temperature,
            "humidity_percent": humidity,
            "wind_speed_kmh": wind_speed,
            "condition": random.choice(["Cerah", "Berawan", "Hujan Ringan"])
        },
        "tide_and_water": {
            "water_level_m": water_level,
            "status": "Aman" if water_level < 2.5 else "Waspada"
        },
        "nearby_water_sources": hydrants
    }

# ============================
# Komunitas Relawan Service
# ============================
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from app.models.komunitas_relawan import KomunitasRelawan
from app.schemas.relawan import KomunitasRelawanCreate, KomunitasRelawanUpdate

def list_komunitas(db: Session, tenant_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(KomunitasRelawan).filter(KomunitasRelawan.tenant_id == tenant_id).offset(skip).limit(limit).all()

def create_komunitas(db: Session, tenant_id: UUID, data: KomunitasRelawanCreate):
    db_obj = KomunitasRelawan(tenant_id=tenant_id, **data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_komunitas(db: Session, tenant_id: UUID, id: UUID):
    obj = db.query(KomunitasRelawan).filter(KomunitasRelawan.id == id, KomunitasRelawan.tenant_id == tenant_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Komunitas not found")
    return obj

def update_komunitas(db: Session, tenant_id: UUID, id: UUID, data: KomunitasRelawanUpdate):
    obj = get_komunitas(db, tenant_id, id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

def delete_komunitas(db: Session, tenant_id: UUID, id: UUID):
    obj = get_komunitas(db, tenant_id, id)
    db.delete(obj)
    db.commit()
    return obj

# ============================
# Pelatihan Relawan Service
# ============================
from app.models.pelatihan_relawan import PelatihanRelawan
from app.schemas.relawan import PelatihanRelawanCreate, PelatihanRelawanUpdate

def list_pelatihan(db: Session, tenant_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(PelatihanRelawan).filter(PelatihanRelawan.tenant_id == tenant_id).offset(skip).limit(limit).all()

def create_pelatihan(db: Session, tenant_id: UUID, data: PelatihanRelawanCreate):
    db_obj = PelatihanRelawan(tenant_id=tenant_id, **data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_pelatihan(db: Session, tenant_id: UUID, id: UUID):
    obj = db.query(PelatihanRelawan).filter(PelatihanRelawan.id == id, PelatihanRelawan.tenant_id == tenant_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Pelatihan not found")
    return obj

def update_pelatihan(db: Session, tenant_id: UUID, id: UUID, data: PelatihanRelawanUpdate):
    obj = get_pelatihan(db, tenant_id, id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

def delete_pelatihan(db: Session, tenant_id: UUID, id: UUID):
    obj = get_pelatihan(db, tenant_id, id)
    db.delete(obj)
    db.commit()
    return obj

# ============================
# Insiden Relawan Service
# ============================
from app.models.insiden_relawan import InsidenRelawan
from app.schemas.relawan import InsidenRelawanCreate, InsidenRelawanUpdate

def list_insiden_relawan(db: Session, tenant_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(InsidenRelawan).filter(InsidenRelawan.tenant_id == tenant_id).offset(skip).limit(limit).all()

def create_insiden_relawan(db: Session, tenant_id: UUID, data: InsidenRelawanCreate):
    db_obj = InsidenRelawan(tenant_id=tenant_id, **data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_insiden_relawan(db: Session, tenant_id: UUID, id: UUID):
    obj = db.query(InsidenRelawan).filter(InsidenRelawan.id == id, InsidenRelawan.tenant_id == tenant_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Insiden not found")
    return obj

def update_insiden_relawan(db: Session, tenant_id: UUID, id: UUID, data: InsidenRelawanUpdate):
    obj = get_insiden_relawan(db, tenant_id, id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

def delete_insiden_relawan(db: Session, tenant_id: UUID, id: UUID):
    obj = get_insiden_relawan(db, tenant_id, id)
    db.delete(obj)
    db.commit()
    return obj
