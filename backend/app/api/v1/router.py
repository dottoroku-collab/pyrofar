from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    approval,
    armada,
    audit_log,
    auth,
    dashboard,
    jadwal_servis,
    jenis_kendaraan,
    laporan,
    lokasi,
    notifikasi,
    pemeliharaan,
    public,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(jenis_kendaraan.router)
api_router.include_router(lokasi.router)
api_router.include_router(armada.router)
api_router.include_router(approval.router)
api_router.include_router(notifikasi.router)
api_router.include_router(pemeliharaan.router)
api_router.include_router(jadwal_servis.router)
api_router.include_router(dashboard.router)
api_router.include_router(analytics.router)
api_router.include_router(laporan.router)
api_router.include_router(audit_log.router)
api_router.include_router(public.router)
api_router.include_router(users.router)

# Seluruh modul FR-01 s.d. FR-26 (Tahap 1) sudah punya router.
# Sprint 7: hardening, testing, deployment (tidak menambah modul baru).
