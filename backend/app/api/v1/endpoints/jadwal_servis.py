from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.jadwal_servis import JadwalServis
from app.models.user import UserRole
from app.schemas.jadwal_servis import JadwalServisCreate, JadwalServisPublic

router = APIRouter(prefix="/jadwal-servis", tags=["Jadwal Servis"])


@router.get("", response_model=list[JadwalServisPublic])
def list_jadwal(
    armada_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(JadwalServis)
    if armada_id:
        query = query.filter(JadwalServis.armada_id == armada_id)
    if status_filter:
        query = query.filter(JadwalServis.status == status_filter)
    return query.order_by(JadwalServis.tanggal_jatuh_tempo).all()


@router.post("", response_model=JadwalServisPublic, status_code=status.HTTP_201_CREATED)
def create_jadwal(
    payload: JadwalServisCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role([UserRole.administrator])),
):
    item = JadwalServis(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
