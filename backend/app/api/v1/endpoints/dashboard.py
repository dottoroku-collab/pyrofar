from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role, require_feature
from app.models.user import UserRole
from app.schemas.dashboard import DashboardSummary, PerJenisItem, PerPostoItem, TrenMaintenanceItem
from app.services import analytics_service as svc

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

ALLOWED_ROLES = [UserRole.administrator, UserRole.pimpinan]


@router.get("/summary", response_model=DashboardSummary, dependencies=[Depends(require_feature("dashboard"))])
def summary(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_summary(db)


@router.get("/per-posko", response_model=list[PerPostoItem], dependencies=[Depends(require_feature("dashboard"))])
def per_posko(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_per_posko(db)


@router.get("/per-jenis", response_model=list[PerJenisItem], dependencies=[Depends(require_feature("dashboard"))])
def per_jenis(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_per_jenis(db)


@router.get("/tren-maintenance", response_model=list[TrenMaintenanceItem], dependencies=[Depends(require_feature("dashboard"))])
def tren_maintenance(
    bulan: int = 12, db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))
):
    return svc.get_tren_maintenance(db, bulan)
