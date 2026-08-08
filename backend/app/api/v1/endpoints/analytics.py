from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.user import UserRole
from app.schemas.dashboard import AnalyticsMTBFMTTR, CostPerVehicleItem, RankingItem
from app.services import analytics_service as svc

router = APIRouter(prefix="/analytics", tags=["Analytics"])

ALLOWED_ROLES = [UserRole.administrator, UserRole.pimpinan, UserRole.kabid]


@router.get("/mtbf-mttr", response_model=list[AnalyticsMTBFMTTR])
def mtbf_mttr(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_mtbf_mttr(db)


@router.get("/cost-per-vehicle", response_model=list[CostPerVehicleItem])
def cost_per_vehicle(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_cost_per_vehicle(db)


@router.get("/ranking", response_model=list[RankingItem])
def ranking(
    tipe: str = "terburuk", db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))
):
    return svc.get_ranking(db, tipe)
