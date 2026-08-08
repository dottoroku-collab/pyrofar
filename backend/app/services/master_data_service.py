from fastapi import HTTPException, status
from sqlalchemy.orm import Session


def list_active(db: Session, model):
    return db.query(model).filter(model.is_deleted.is_(False)).order_by(model.nama).all()


def create_named(db: Session, model, payload_dict: dict):
    exists = (
        db.query(model)
        .filter(model.nama == payload_dict["nama"], model.is_deleted.is_(False))
        .first()
    )
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{payload_dict['nama']}' sudah ada",
        )
    item = model(**payload_dict)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_active_or_404(db: Session, model, item_id: int):
    item = db.query(model).filter(model.id == item_id, model.is_deleted.is_(False)).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data tidak ditemukan")
    return item


def update_named(db: Session, item, payload_dict: dict):
    for key, value in payload_dict.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def soft_delete(db: Session, item):
    item.is_deleted = True
    db.commit()
