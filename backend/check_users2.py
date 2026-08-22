from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
try:
    users = db.query(User).all()
    for user in users:
        print(f"{user.username} - {user.email} - {user.role}")
finally:
    db.close()
