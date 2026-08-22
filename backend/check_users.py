import sys
import os
sys.path.append(os.getcwd())
from app.core.database import SessionLocal
from app.models.user import User
db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(f"{u.email} - {u.role}")
