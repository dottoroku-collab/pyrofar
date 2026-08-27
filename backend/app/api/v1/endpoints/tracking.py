"""Real-time personnel location tracking endpoints."""
import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.personnel_tracking import PersonnelTracking
from app.models.user import User, UserRole

router = APIRouter(prefix="/tracking", tags=["Personnel Tracking"])

# Roles that are NOT tracked (leadership / admin)
NON_TRACKED_ROLES = {UserRole.pimpinan, UserRole.administrator}

# Valid personnel statuses
VALID_STATUSES = {"standby", "berangkat", "penanganan"}


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class LocationUpdateRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy_m: Optional[float] = None
    speed_kmh: Optional[float] = None
    heading: Optional[float] = Field(None, ge=0, le=360)
    battery_pct: Optional[int] = Field(None, ge=0, le=100)
    personnel_status: Optional[str] = Field("standby", description="standby | berangkat | penanganan")


class PersonnelLocationItem(BaseModel):
    user_id: int
    nama: str
    role: str
    regu: Optional[str] = None
    pleton: Optional[str] = None
    latitude: float
    longitude: float
    accuracy_m: Optional[float] = None
    speed_kmh: Optional[float] = None
    heading: Optional[float] = None
    battery_pct: Optional[int] = None
    personnel_status: str = "standby"
    updated_at: str
    
    # Armada info
    armada_id: Optional[int] = None
    armada_nama: Optional[str] = None
    armada_no_polisi: Optional[str] = None
    
    # Operator info
    foto_url: Optional[str] = None
    sim_expiry_date: Optional[str] = None
    nip_nik: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/update-location", status_code=status.HTTP_200_OK)
def update_location(
    payload: LocationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Menerima update koordinat GPS dari aplikasi mobile.

    Hanya role operator yang diperbolehkan. Pimpinan & Administrator
    akan mendapat HTTP 403.
    """
    if current_user.role in NON_TRACKED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tracking tidak aktif untuk role ini.",
        )

    # Sanitise status
    p_status = payload.personnel_status or "standby"
    if p_status not in VALID_STATUSES:
        p_status = "standby"

    # UPSERT: update jika sudah ada, insert jika belum
    existing = (
        db.query(PersonnelTracking)
        .filter(PersonnelTracking.user_id == current_user.id)
        .first()
    )

    if existing:
        existing.latitude = payload.latitude
        existing.longitude = payload.longitude
        existing.accuracy_m = payload.accuracy_m
        existing.speed_kmh = payload.speed_kmh
        existing.heading = payload.heading
        existing.battery_pct = payload.battery_pct
        existing.personnel_status = p_status
        existing.updated_at = datetime.datetime.now(datetime.timezone.utc)
    else:
        new_record = PersonnelTracking(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            accuracy_m=payload.accuracy_m,
            speed_kmh=payload.speed_kmh,
            heading=payload.heading,
            battery_pct=payload.battery_pct,
            personnel_status=p_status,
        )
        db.add(new_record)

    db.commit()
    return {"message": "Lokasi diperbarui"}


@router.get("/active", response_model=List[PersonnelLocationItem])
def get_active_personnel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mendapatkan daftar personil yang aktif (update terakhir < 2 menit).

    Digunakan oleh dashboard Command Center untuk menampilkan posisi
    personil di peta.
    """
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=2)

    from app.models.armada import Armada
    from app.models.operator_lapangan import OperatorLapangan
    records = (
        db.query(PersonnelTracking, Armada, OperatorLapangan)
        .outerjoin(Armada, Armada.driver_id == PersonnelTracking.user_id)
        .outerjoin(OperatorLapangan, OperatorLapangan.user_id == PersonnelTracking.user_id)
        .filter(
            PersonnelTracking.tenant_id == current_user.tenant_id,
            PersonnelTracking.updated_at >= cutoff,
        )
        .all()
    )

    items = []
    for r, armada, operator in records:
        regu_name = None
        pleton_name = None
        if r.user and r.user.personil and r.user.personil.regu:
            regu_name = r.user.personil.regu.nama
            if r.user.personil.regu.pleton:
                pleton_name = r.user.personil.regu.pleton.nama

        # Get operator details if present
        foto_url = operator.foto_url if operator else None
        sim_expiry_date = operator.sim_expiry_date if operator else None
        nip_nik = operator.nip_nik if operator else None

        items.append(
            PersonnelLocationItem(
                user_id=r.user_id,
                nama=r.user.nama if r.user else f"User #{r.user_id}",
                role=r.user.role.value if r.user else "unknown",
                regu=regu_name,
                pleton=pleton_name,
                latitude=r.latitude,
                longitude=r.longitude,
                accuracy_m=r.accuracy_m,
                speed_kmh=r.speed_kmh,
                heading=r.heading,
                battery_pct=r.battery_pct,
                personnel_status=r.personnel_status or "standby",
                updated_at=r.updated_at.isoformat(),
                armada_id=armada.id if armada else None,
                armada_nama=armada.nama_armada or armada.kode_armada if armada else None,
                armada_no_polisi=armada.no_polisi if armada else None,
                foto_url=foto_url,
                sim_expiry_date=sim_expiry_date.isoformat() if sim_expiry_date else None,
                nip_nik=nip_nik,
            )
        )
    return items


@router.delete("/clear", status_code=status.HTTP_200_OK)
def clear_location(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Menghapus data lokasi personil saat logout dari aplikasi mobile."""
    db.query(PersonnelTracking).filter(
        PersonnelTracking.user_id == current_user.id
    ).delete()
    db.commit()
    return {"message": "Data lokasi dihapus"}
