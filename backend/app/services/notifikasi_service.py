from sqlalchemy.orm import Session

from app.models.notifikasi import Notifikasi
from app.models.user import User, UserRole


def notify_users_by_role(
    db: Session, role: UserRole, jenis: str, pesan: str, armada_id: int | None = None
) -> None:
    users = (
        db.query(User)
        .filter(User.role == role, User.is_deleted.is_(False), User.is_active.is_(True))
        .all()
    )
    for u in users:
        db.add(Notifikasi(user_id=u.id, armada_id=armada_id, jenis=jenis, pesan=pesan))
    db.commit()


def notify_user(db: Session, user_id: int, jenis: str, pesan: str, armada_id: int | None = None) -> None:
    db.add(Notifikasi(user_id=user_id, armada_id=armada_id, jenis=jenis, pesan=pesan))
    db.commit()
