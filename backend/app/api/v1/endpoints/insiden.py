from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

from app.core.database import get_db
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.schemas.insiden import InsidenCreate, InsidenUpdate, InsidenResponse, DispatchReguRequest
from app.services import insiden_service, whatsapp_service

router = APIRouter(prefix="/insiden", tags=["Insiden"])


class WhatsAppBroadcastRequest(BaseModel):
    target: Optional[str] = None


@router.get("/", response_model=List[InsidenResponse])
def get_all_insiden(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return insiden_service.list_insiden(db, ctx.tenant_id, user=ctx.user, skip=skip, limit=limit)

@router.post("/", response_model=InsidenResponse, status_code=status.HTTP_201_CREATED)
def create_insiden(
    insiden_in: InsidenCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return insiden_service.create_insiden(db, ctx.tenant_id, insiden_in)

@router.get("/{id}", response_model=InsidenResponse)
def read_insiden(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return insiden_service.get_insiden(db, ctx.tenant_id, id)

@router.patch("/{id}", response_model=InsidenResponse)
def update_insiden(
    id: UUID,
    insiden_in: InsidenUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return insiden_service.update_insiden(db, ctx.tenant_id, id, insiden_in, user=ctx.user)

@router.post("/{id}/dispatch", response_model=InsidenResponse)
def dispatch_insiden(
    id: UUID,
    payload: DispatchReguRequest,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    return insiden_service.dispatch_regu(db, ctx.tenant_id, id, payload)

@router.post("/{id}/broadcast-whatsapp")
def broadcast_insiden_whatsapp(
    id: UUID,
    payload: WhatsAppBroadcastRequest = WhatsAppBroadcastRequest(),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    insiden = insiden_service.get_insiden(db, ctx.tenant_id, id)
    result = whatsapp_service.notify_incident_verified(insiden, db=db, target_override=payload.target)
    return {
        "success": result.get("status", False),
        "result": result,
        "message": "Pesan WhatsApp berhasil dikirim" if result.get("status") else f"Pesan WhatsApp gagal dikirim: {result.get('error') or result.get('message')}"
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_insiden(
    id: UUID,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context)
):
    insiden_service.delete_insiden(db, ctx.tenant_id, id)
    return None
