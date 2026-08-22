from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.station import StationCreate, StationUpdate, StationResponse
from app.services import station_service

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("", response_model=List[StationResponse])
def get_all_stations(
    is_relawan_post: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return station_service.list_stations(db, ctx.tenant_id, is_relawan_post=is_relawan_post, skip=skip, limit=limit)

@router.post("", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
def create_station(
    station_in: StationCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return station_service.create_station(db, ctx.tenant_id, station_in)

@router.get("/{id}", response_model=StationResponse)
def read_station(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return station_service.get_station(db, ctx.tenant_id, id)

@router.patch("/{id}", response_model=StationResponse)
def update_station(
    id: UUID,
    station_in: StationUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return station_service.update_station(db, ctx.tenant_id, id, station_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_station(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    station_service.delete_station(db, ctx.tenant_id, id)
