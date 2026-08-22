from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@damkar.makassar.go.id").first()
print(f"Role: {user.role}, Type: {type(user.role)}")
