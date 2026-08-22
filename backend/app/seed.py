"""Jalankan sekali setelah migrasi: python -m app.seed

Membuat:
1. Tenant Damkar Kota Makassar (jika belum ada).
2. Akun Administrator awal agar sistem bisa langsung dipakai login.

Aman dijalankan berulang kali (idempotent).
"""
from uuid import UUID

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.tenant import Tenant, TenantSettings, TenantStatus
from app.models.user import User, UserRole

MAKASSAR_TENANT_ID = UUID("00000000-0000-0000-0000-000000000001")


def run():
    db = SessionLocal()
    try:
        # ---- 1. Ensure Makassar tenant exists ---- #
        tenant = db.query(Tenant).filter(Tenant.id == MAKASSAR_TENANT_ID).first()
        if not tenant:
            tenant = Tenant(
                id=MAKASSAR_TENANT_ID,
                name="Damkar Kota Makassar",
                slug="damkar-makassar",
                status=TenantStatus.active,
                plan_code="ENTERPRISE",
            )
            db.add(tenant)
            db.commit()
            print("Tenant 'Damkar Kota Makassar' dibuat.")

            # Ensure tenant_settings exists too
            ts = TenantSettings(
                tenant_id=MAKASSAR_TENANT_ID,
                app_name="PYROFAR",
                app_short_name="PYROFAR",
                organization_name="Dinas Pemadam Kebakaran & Penyelamatan",
                region_name="Kota Makassar",
                primary_color="#C62828",
                secondary_color="#1A1D23",
            )
            db.add(ts)
            db.commit()
            print("Tenant settings Makassar dibuat.")
        else:
            print("Tenant Makassar sudah ada, skip.")

        # ---- 2. Ensure admin user exists ---- #
        existing = db.query(User).filter(
            User.email == "bigboss@pyrofar.com"
        ).first()
        if existing:
            print("Admin sudah ada, skip seeding.")
            return

        admin = User(
            tenant_id=MAKASSAR_TENANT_ID,
            nama="Administrator",
            email="bigboss@pyrofar.com",
            password_hash=hash_password("ChangeMe123!"),
            role=UserRole.administrator,
            is_active=True,
            is_superadmin=True,
        )
        db.add(admin)
        db.commit()
        print("Akun Administrator awal dibuat: bigboss@pyrofar.com / ChangeMe123!")
        print("SEGERA ganti password ini setelah login pertama.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
