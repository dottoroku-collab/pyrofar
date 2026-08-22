from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role, require_feature, require_permission
from app.dependencies.tenant import TenantContext, get_tenant_context
from app.models.pemeliharaan import Pemeliharaan
from app.models.sparepart import Sparepart
from app.models.user import User, UserRole
from app.schemas.pemeliharaan import (
    PemeliharaanCreate,
    PemeliharaanPublic,
    PemeliharaanUpdate,
    SparepartCreate,
    SparepartPublic,
)
from app.services import pemeliharaan_service as svc
from app.utils.file_storage import save_upload

router = APIRouter(prefix="/pemeliharaan", tags=["Pemeliharaan"])


def _get_or_404(db: Session, tenant_id: str, pemeliharaan_id: int) -> Pemeliharaan:
    item = (
        db.query(Pemeliharaan)
        .filter(
            Pemeliharaan.tenant_id == tenant_id,
            Pemeliharaan.id == pemeliharaan_id,
            Pemeliharaan.is_deleted.is_(False)
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data pemeliharaan tidak ditemukan")
    return item


@router.get("", response_model=list[PemeliharaanPublic], dependencies=[Depends(require_feature("pemeliharaan"))])
def list_pemeliharaan(
    armada_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _=Depends(require_permission("view_pemeliharaan")),
):
    query = db.query(Pemeliharaan).filter(
        Pemeliharaan.tenant_id == ctx.tenant_id,
        Pemeliharaan.is_deleted.is_(False)
    )
    if armada_id:
        query = query.filter(Pemeliharaan.armada_id == armada_id)
    if status_filter:
        query = query.filter(Pemeliharaan.status == status_filter)
    return query.order_by(Pemeliharaan.tanggal.desc()).all()


@router.post("", response_model=PemeliharaanPublic, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("pemeliharaan"))])
def create_pemeliharaan(
    payload: PemeliharaanCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    return svc.create_pemeliharaan(db, payload, current_user, ctx.tenant_id)


@router.get("/{pemeliharaan_id}", response_model=PemeliharaanPublic, dependencies=[Depends(require_feature("pemeliharaan"))])
def get_pemeliharaan(
    pemeliharaan_id: int,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _=Depends(require_permission("view_pemeliharaan"))
):
    return _get_or_404(db, ctx.tenant_id, pemeliharaan_id)


@router.put("/{pemeliharaan_id}", response_model=PemeliharaanPublic, dependencies=[Depends(require_feature("pemeliharaan"))])
def update_pemeliharaan(
    pemeliharaan_id: int,
    payload: PemeliharaanUpdate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    item = _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    return svc.update_pemeliharaan(db, item, payload)


@router.delete("/{pemeliharaan_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_feature("pemeliharaan"))])
def delete_pemeliharaan(
    pemeliharaan_id: int,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    item = _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    svc.soft_delete(db, item, current_user)


@router.post("/{pemeliharaan_id}/sparepart", response_model=SparepartPublic, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_feature("pemeliharaan"))])
def add_sparepart(
    pemeliharaan_id: int,
    payload: SparepartCreate,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    sparepart = Sparepart(**payload.model_dump(), pemeliharaan_id=pemeliharaan_id)
    db.add(sparepart)
    db.commit()
    db.refresh(sparepart)
    return sparepart


@router.delete("/{pemeliharaan_id}/sparepart/{sparepart_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_feature("pemeliharaan"))])
def delete_sparepart(
    pemeliharaan_id: int,
    sparepart_id: int,
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    sparepart = (
        db.query(Sparepart)
        .filter(Sparepart.id == sparepart_id, Sparepart.pemeliharaan_id == pemeliharaan_id)
        .first()
    )
    if not sparepart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sparepart tidak ditemukan")
    sparepart.is_deleted = True
    db.commit()


@router.post("/{pemeliharaan_id}/foto-sebelum", response_model=PemeliharaanPublic, dependencies=[Depends(require_feature("pemeliharaan"))])
def upload_foto_sebelum(
    pemeliharaan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    item = _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    item.foto_sebelum_url = save_upload(file, subfolder=f"pemeliharaan/{pemeliharaan_id}")
    db.commit()
    db.refresh(item)
    return item


@router.post("/{pemeliharaan_id}/foto-sesudah", response_model=PemeliharaanPublic, dependencies=[Depends(require_feature("pemeliharaan"))])
def upload_foto_sesudah(
    pemeliharaan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    ctx: TenantContext = Depends(get_tenant_context),
    _current_user: User = Depends(require_permission("manage_pemeliharaan")),
):
    item = _get_or_404(db, ctx.tenant_id, pemeliharaan_id)
    item.foto_sesudah_url = save_upload(file, subfolder=f"pemeliharaan/{pemeliharaan_id}")
    db.commit()
    db.refresh(item)
    return item
