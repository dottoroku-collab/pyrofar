from sqlalchemy.orm import Session

from app.models.app_settings import AppSettings


DEFAULT_SETTINGS = {
    "app_name": "PYROFAR - Integrated Fire & Rescue Operations Platform",
    "app_short_name": "PYROFAR",
    "organization_name": "Dinas Pemadam Kebakaran & Penyelamatan",
    "region_name": "Kota Makassar",
    "logo_url": None,
    "primary_color": "#C62828",
    "secondary_color": "#263238",
    "contact_email": None,
    "contact_phone": None,
    "address": None,
}


def get_settings(db: Session) -> AppSettings:
    settings = db.query(AppSettings).first()

    if settings:
        return settings

    settings = AppSettings(**DEFAULT_SETTINGS)

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


def update_settings(
    db: Session,
    data: dict,
) -> AppSettings:
    settings = get_settings(db)

    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings