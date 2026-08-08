"""Jalankan sekali setelah migrasi: python -m app.seed
Membuat akun Administrator awal agar sistem bisa langsung dipakai login.
"""
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


def run():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@damkar.makassar.go.id").first()
        if existing:
            print("Admin sudah ada, skip seeding.")
            return

        admin = User(
            nama="Administrator",
            email="admin@damkar.makassar.go.id",
            password_hash=hash_password("ChangeMe123!"),
            role=UserRole.administrator,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Akun Administrator awal dibuat: admin@damkar.makassar.go.id / ChangeMe123!")
        print("SEGERA ganti password ini setelah login pertama.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
