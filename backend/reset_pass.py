import sys
import os
sys.path.append(os.getcwd())
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
db = SessionLocal()
users = db.query(User).filter(User.email == "operatorcc@pyrofar.com").all()
for u in users:
    u.password_hash = hash_password("password123")
db.commit()
print("Passwords reset to password123")
