from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from fastapi import HTTPException, status
from app.models.station import Station
from app.schemas.station import StationCreate, StationUpdate

def get_station(db: Session, tenant_id: UUID, station_id: UUID) -> Station:
    station = db.query(Station).filter(
        Station.id == station_id,
        Station.tenant_id == tenant_id
    ).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

def list_stations(db: Session, tenant_id: UUID, is_relawan_post: Optional[bool] = None, skip: int = 0, limit: int = 100):
    query = db.query(Station).filter(Station.tenant_id == tenant_id)
    if is_relawan_post is not None:
        query = query.filter(Station.is_relawan_post == is_relawan_post)
    return query.offset(skip).limit(limit).all()

def create_station(db: Session, tenant_id: UUID, station_in: StationCreate) -> Station:
    db_station = Station(
        tenant_id=tenant_id,
        **station_in.model_dump()
    )
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station

def update_station(db: Session, tenant_id: UUID, station_id: UUID, station_in: StationUpdate) -> Station:
    db_station = get_station(db, tenant_id, station_id)
    
    update_data = station_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_station, field, value)
        
    db.commit()
    db.refresh(db_station)
    return db_station

def delete_station(db: Session, tenant_id: UUID, station_id: UUID) -> None:
    db_station = get_station(db, tenant_id, station_id)
    db.delete(db_station)
    db.commit()
