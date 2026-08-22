"""Tenant API endpoints.

Phase 1 exposes:
- GET  /tenants/me           — Current user's tenant info
- GET  /tenants/me/settings  — Current tenant settings (branding)
- PATCH /tenants/me/settings — Update tenant settings (admin only)
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from uuid import uuid4
from pathlib import Path
from PIL import Image
from io import BytesIO

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.models.user import UserRole
from app.schemas.tenant import (
    TenantMeResponse,
    TenantPublic,
    TenantSettingsPublic,
    TenantSettingsUpdate,
)
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.services import tenant_service, whatsapp_service

router = APIRouter(prefix="/tenants", tags=["Tenant"])

BASE_DIR = Path(__file__).resolve().parents[4]
UPLOAD_DIR = BASE_DIR / "uploads" / "media"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.get("/me", response_model=TenantMeResponse)
def get_my_tenant(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db),
):
    """Return the authenticated user's tenant info + settings."""
    settings = tenant_service.get_tenant_settings(db, ctx.tenant_id)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Konfigurasi tenant tidak ditemukan.",
        )
    return TenantMeResponse(
        tenant=TenantPublic.model_validate(ctx.tenant),
        settings=TenantSettingsPublic.model_validate(settings),
    )


@router.get("/me/settings", response_model=TenantSettingsPublic)
def get_my_tenant_settings(
    ctx: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_db),
):
    """Return branding/config for the current tenant."""
    settings = tenant_service.get_tenant_settings(db, ctx.tenant_id)
    if settings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Konfigurasi tenant tidak ditemukan.",
        )
    return TenantSettingsPublic.model_validate(settings)


@router.patch("/me/settings", response_model=TenantSettingsPublic)
def update_my_tenant_settings(
    data: TenantSettingsUpdate,
    ctx: TenantContext = Depends(get_tenant_context),
    _: None = Depends(require_role(UserRole.administrator)),
    db: Session = Depends(get_db),
):
    """Update tenant settings. Administrator only."""
    updated = tenant_service.update_tenant_settings(db, ctx.tenant_id, data)
    return TenantSettingsPublic.model_validate(updated)

@router.post("/me/settings/media", response_model=TenantSettingsPublic)
async def upload_dashboard_media(
    file: UploadFile = File(...),
    ctx: TenantContext = Depends(get_tenant_context),
    _: None = Depends(require_role(UserRole.administrator)),
    db: Session = Depends(get_db),
):
    """Upload dashboard media image (16:9 ratio). Administrator only."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format media harus JPG, PNG, atau WebP",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ukuran media maksimal 5 MB",
        )

    try:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content)).convert("RGBA")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File yang diunggah bukan gambar yang valid",
        )

    # Convert to 1920x1080 (16:9)
    image.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
    
    canvas = Image.new("RGBA", (1920, 1080), (255, 255, 255, 0))
    x = (1920 - image.width) // 2
    y = (1080 - image.height) // 2
    canvas.alpha_composite(image, (x, y))

    filename = f"media-{uuid4().hex}.webp"
    filepath = UPLOAD_DIR / filename

    canvas.save(filepath, "WEBP", quality=90, method=6)

    settings = tenant_service.get_tenant_settings(db, ctx.tenant_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Tenant settings not found")

    # Remove old media if it exists
    if settings.dashboard_image_url:
        old_filename = Path(settings.dashboard_image_url).name
        old_file = UPLOAD_DIR / old_filename
        if old_file.exists():
            old_file.unlink()

    update_data = TenantSettingsUpdate(dashboard_image_url=f"/uploads/media/{filename}")
    updated = tenant_service.update_tenant_settings(db, ctx.tenant_id, update_data)
    
    return TenantSettingsPublic.model_validate(updated)

@router.post("/me/settings/logo", response_model=TenantSettingsPublic)
async def upload_dashboard_logo(
    file: UploadFile = File(...),
    ctx: TenantContext = Depends(get_tenant_context),
    _: None = Depends(require_role(UserRole.administrator)),
    db: Session = Depends(get_db),
):
    """Upload dashboard logo image (1:1 ratio). Administrator only."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format logo harus JPG, PNG, atau WebP",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ukuran logo maksimal 5 MB",
        )

    try:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content)).convert("RGBA")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File yang diunggah bukan gambar yang valid",
        )

    # Convert to 512x512
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    
    canvas = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
    x = (512 - image.width) // 2
    y = (512 - image.height) // 2
    canvas.alpha_composite(image, (x, y))

    filename = f"logo-{uuid4().hex}.webp"
    filepath = UPLOAD_DIR / filename

    canvas.save(filepath, "WEBP", quality=90, method=6)

    settings = tenant_service.get_tenant_settings(db, ctx.tenant_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Tenant settings not found")

    # Remove old logo if it exists
    if settings.logo_url:
        old_filename = Path(settings.logo_url).name
        old_file = UPLOAD_DIR / old_filename
        if old_file.exists():
            old_file.unlink()

    settings.logo_url = f"/uploads/logos/{filename}"
    db.commit()
    db.refresh(settings)
    return TenantSettingsPublic.model_validate(settings)


class WhatsAppTestPayload(BaseModel):
    target: Optional[str] = None
    message: Optional[str] = None
    provider: Optional[str] = None
    api_token: Optional[str] = None
    api_url: Optional[str] = None
    instance_name: Optional[str] = None


@router.post("/me/settings/test-whatsapp")
def test_whatsapp_gateway(
    payload: WhatsAppTestPayload = WhatsAppTestPayload(),
    ctx: TenantContext = Depends(get_tenant_context),
    _: None = Depends(require_role(UserRole.administrator)),
    db: Session = Depends(get_db),
):
    """Kirim pesan uji coba WhatsApp gateway. Administrator only."""
    msg = payload.message or (
        "🚒 *TEST NOTIFIKASI WHATSAPP - SIM ARMADA (PYROFAR)* 🚒\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "✅ Koneksi WhatsApp Gateway berhasil terhubung dengan server SIM Armada!\n"
        f"⏰ Waktu Uji Coba: {whatsapp_service.format_wita_time()}\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "_Notifikasi ini dikirim dari Menu Pengaturan Aplikasi._"
    )

    config_override = {"enabled": True}
    if payload.provider:
        config_override["provider"] = payload.provider
    if payload.api_token:
        config_override["api_token"] = payload.api_token
    if payload.api_url:
        config_override["api_url"] = payload.api_url
    if payload.instance_name:
        config_override["instance_name"] = payload.instance_name

    res = whatsapp_service.send_whatsapp_message(
        target=payload.target or "",
        message=msg,
        db=db,
        tenant_id=ctx.tenant_id,
        config_override=config_override
    )

    is_success = res.get("status", False)
    return {
        "success": is_success,
        "result": res,
        "message": (
            "Pesan uji coba WhatsApp berhasil dikirim!"
            if is_success
            else f"Gagal mengirim pesan WhatsApp: {res.get('message') or 'Terjadi kendala pada gateway'}"
        )
    }


