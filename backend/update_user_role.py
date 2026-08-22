from app.core.database import SessionLocal
from app.models.user import User, UserRole

def main():
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == "199007082019031002").first()
        if user:
            user.role = UserRole.operator_lapangan_damkar
            db.commit()
            print(f"Role updated for {user.nama} to {user.role}")
        else:
            print("User not found.")

if __name__ == "__main__":
    main()
