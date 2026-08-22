from app.core.database import SessionLocal
from app.models.user import User, UserRole

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@damkar.makassar.go.id").first()
if user:
    user.role = UserRole.administrator
    db.commit()
    print("Role updated to administrator!")
else:
    print("User not found!")
