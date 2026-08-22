from fastapi import APIRouter

from app.api.v1.endpoints import ( stations,
    analytics,
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
    tenants,
    users,
    settings,
    license,
    insiden,
    pencegahan,
    sarana,
    relawan,
    edukasi,
    health,
    provisioning,
    tracking,
    operations,
    ptt,
    superadmin,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(provisioning.router)
api_router.include_router(auth.router)
api_router.include_router(jenis_kendaraan.router)
api_router.include_router(lokasi.router)
api_router.include_router(armada.router)
api_router.include_router(notifikasi.router)
api_router.include_router(pemeliharaan.router)
api_router.include_router(jadwal_servis.router)
api_router.include_router(dashboard.router)
api_router.include_router(analytics.router)
api_router.include_router(laporan.router)
api_router.include_router(audit_log.router)
api_router.include_router(public.router)
api_router.include_router(users.router)
api_router.include_router(settings.router)
api_router.include_router(license.router)
api_router.include_router(tenants.router)  # Phase 1: tenant management
api_router.include_router(insiden.router)
api_router.include_router(pencegahan.router)
api_router.include_router(sarana.router)
api_router.include_router(relawan.router)
api_router.include_router(edukasi.router)

# Seluruh modul FR-01 s.d. FR-26 (Tahap 1) sudah punya router.
# Sprint 7: hardening, testing, deployment (tidak menambah modul baru).
api_router.include_router(stations.router)
api_router.include_router(tracking.router)
api_router.include_router(operations.router, tags=["operations"])
api_router.include_router(ptt.router, prefix="/ptt", tags=["ptt"])
api_router.include_router(superadmin.router, prefix="/superadmin", tags=["Superadmin"])

