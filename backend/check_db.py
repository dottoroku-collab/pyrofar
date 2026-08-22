from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"User: {u.email}, Role: {u.role}, Active: {u.is_active}")
