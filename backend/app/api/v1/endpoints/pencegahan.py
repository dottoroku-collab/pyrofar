from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.inspeksi import InspeksiCreate, InspeksiUpdate, InspeksiResponse
from app.services import pencegahan_service

router = APIRouter(prefix="/pencegahan", tags=["Pencegahan"])

@router.get("/inspeksi", response_model=List[InspeksiResponse])
def get_all_inspeksi(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return pencegahan_service.list_inspeksi(db, ctx.tenant_id, skip=skip, limit=limit)

@router.post("/inspeksi", response_model=InspeksiResponse, status_code=status.HTTP_201_CREATED)
def create_inspeksi(
    inspeksi_in: InspeksiCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return pencegahan_service.create_inspeksi(db, ctx.tenant_id, ctx.user.id, inspeksi_in)

@router.get("/inspeksi/{id}", response_model=InspeksiResponse)
def read_inspeksi(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return pencegahan_service.get_inspeksi(db, ctx.tenant_id, id)

@router.patch("/inspeksi/{id}", response_model=InspeksiResponse)
def update_inspeksi(
    id: UUID,
    inspeksi_in: InspeksiUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return pencegahan_service.update_inspeksi(db, ctx.tenant_id, id, inspeksi_in)
