from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.inventaris import InventarisCreate, InventarisUpdate, InventarisResponse
from app.models.inventaris import TipeBarang
from app.services import sarana_service
from typing import Optional

router = APIRouter(prefix="/sarana", tags=["Sarana"])

@router.get("/inventaris", response_model=List[InventarisResponse])
def get_all_inventaris(
    tipe_barang: Optional[TipeBarang] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return sarana_service.list_inventaris(db, ctx.tenant_id, tipe_barang=tipe_barang, skip=skip, limit=limit)

@router.post("/inventaris", response_model=InventarisResponse, status_code=status.HTTP_201_CREATED)
def create_inventaris(
    inventaris_in: InventarisCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return sarana_service.create_inventaris(db, ctx.tenant_id, inventaris_in)

@router.get("/inventaris/{id}", response_model=InventarisResponse)
def read_inventaris(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return sarana_service.get_inventaris(db, ctx.tenant_id, id)

@router.patch("/inventaris/{id}", response_model=InventarisResponse)
def update_inventaris(
    id: UUID,
    inventaris_in: InventarisUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return sarana_service.update_inventaris(db, ctx.tenant_id, id, inventaris_in)
