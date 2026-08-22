from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role, require_feature
from app.models.user import UserRole
from app.schemas.dashboard import AnalyticsMTBFMTTR, CostPerVehicleItem, RankingItem
from app.services import analytics_service as svc

router = APIRouter(prefix="/analytics", tags=["Analytics"])

ALLOWED_ROLES = [UserRole.administrator, UserRole.pimpinan]


@router.get("/mtbf-mttr", response_model=list[AnalyticsMTBFMTTR], dependencies=[Depends(require_feature("analytics"))])
def mtbf_mttr(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_mtbf_mttr(db)


@router.get("/cost-per-vehicle", response_model=list[CostPerVehicleItem], dependencies=[Depends(require_feature("analytics"))])
def cost_per_vehicle(db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))):
    return svc.get_cost_per_vehicle(db)


@router.get("/ranking", response_model=list[RankingItem], dependencies=[Depends(require_feature("analytics"))])
def ranking(
    tipe: str = "terburuk", db: Session = Depends(get_db), _=Depends(require_role(ALLOWED_ROLES))
):
    return svc.get_ranking(db, tipe)


from app.schemas.dashboard import IncidentAnalyticsResponse

@router.get("/incidents", response_model=IncidentAnalyticsResponse, dependencies=[Depends(require_feature("analytics"))])
def incident_analytics(
    time_range: str = "30_days", 
    db: Session = Depends(get_db), 
    _=Depends(require_role(ALLOWED_ROLES))
):
    # Optional: pass tenant_id if tenant-based analytics is active
    return svc.get_incident_analytics(db, time_range=time_range)
