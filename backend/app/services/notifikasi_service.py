from sqlalchemy.orm import Session

from app.models.notifikasi import Notifikasi
from app.models.user import User, UserRole


def notify_users_by_role(
    db: Session, role: UserRole, jenis: str, pesan: str, armada_id: int | None = None, tenant_id=None
) -> None:
    query = db.query(User).filter(User.role == role, User.is_deleted.is_(False), User.is_active.is_(True))
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    users = query.all()

    for u in users:
        db.add(Notifikasi(tenant_id=u.tenant_id, user_id=u.id, armada_id=armada_id, jenis=jenis, pesan=pesan))
    db.commit()


def notify_user(db: Session, user_id: int, jenis: str, pesan: str, armada_id: int | None = None) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.add(Notifikasi(tenant_id=user.tenant_id, user_id=user.id, armada_id=armada_id, jenis=jenis, pesan=pesan))
        db.commit()
