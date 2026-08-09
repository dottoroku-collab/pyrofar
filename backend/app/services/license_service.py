import base64
import json
from pathlib import Path
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.license import License

from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature


PUBLIC_KEY_FILE = (
    Path(__file__).resolve().parents[1]
    / "core"
    / "keys"
    / "license_public_key.pem"
)


def _load_public_key():
    return serialization.load_pem_public_key(
        PUBLIC_KEY_FILE.read_bytes()
    )

def _verify_license_key(license_key: str) -> dict:
    try:
        parts = license_key.split(".")

        if len(parts) != 3:
            raise ValueError("Format license key tidak valid")

        prefix, payload_encoded, signature_encoded = parts

        if prefix != "SAM1":
            raise ValueError("Versi license key tidak dikenali")

        def decode_base64url(value: str) -> bytes:
            padding = "=" * (-len(value) % 4)
            return base64.urlsafe_b64decode(
                value + padding
            )

        payload_bytes = decode_base64url(payload_encoded)
        signature = decode_base64url(signature_encoded)

        public_key = _load_public_key()

        public_key.verify(
            signature,
            payload_bytes,
        )

        payload = json.loads(
            payload_bytes.decode("utf-8")
        )

        if not isinstance(payload, dict):
            raise ValueError(
                "Payload license tidak valid"
            )

        return payload

    except (ValueError, json.JSONDecodeError, InvalidSignature) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode lisensi tidak valid atau telah dimodifikasi",
        ) from exc


def _parse_features(value: str | None) -> list[str]:
    if not value:
        return []

    try:
        data = json.loads(value)

        if isinstance(data, list):
            return [str(item) for item in data]

    except (json.JSONDecodeError, TypeError):
        pass

    return []


def _serialize_license(license: License) -> dict:
    return {
        "id": license.id,
        "license_id": license.license_id,
        "plan_code": license.plan_code,
        "plan_name": license.plan_name,
        "organization_name": license.organization_name,
        "issued_at": license.issued_at,
        "expires_at": license.expires_at,
        "max_users": license.max_users,
        "max_armada": license.max_armada,
        "features": _parse_features(license.features),
        "is_active": license.is_active,
        "activated_at": license.activated_at,
        "created_at": license.created_at,
    }


def get_active_license(
    db: Session,
) -> License | None:

    license = (
        db.query(License)
        .filter(License.is_active.is_(True))
        .order_by(License.id.desc())
        .first()
    )

    if not license:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    if license.expires_at < now:
        license.is_active = False
        db.commit()
        return None

    return license


def get_license_status(db: Session) -> dict:
    license = get_active_license(db)

    if not license:
        return {
            "activated": False,
            "license": None,
        }

    return {
        "activated": True,
        "license": _serialize_license(license),
    }


def activate_license(
    db: Session,
    license_key: str,
) -> dict:
    license_key = license_key.strip()

    # 1. Verifikasi signature dan decode payload
    payload = _verify_license_key(license_key)

    # 2. Validasi field wajib
    required_fields = [
        "license_id",
        "plan_code",
        "plan_name",
        "issued_at",
        "expires_at",
    ]

    for field in required_fields:
        if not payload.get(field):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payload lisensi tidak memiliki field '{field}'",
            )

    try:
        issued_at = datetime.fromisoformat(
            payload["issued_at"].replace("Z", "+00:00")
        )

        expires_at = datetime.fromisoformat(
            payload["expires_at"].replace("Z", "+00:00")
        )

        # Database menggunakan DateTime tanpa timezone
        if issued_at.tzinfo is not None:
            issued_at = issued_at.astimezone(timezone.utc).replace(
                tzinfo=None
            )

        if expires_at.tzinfo is not None:
            expires_at = expires_at.astimezone(timezone.utc).replace(
                tzinfo=None
            )

    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format tanggal lisensi tidak valid",
        ) from exc

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # 3. Cek tanggal lisensi
    if expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lisensi sudah kedaluwarsa",
        )

    # 4. Cek license_id yang mungkin sudah terdaftar
    existing = (
        db.query(License)
        .filter(License.license_id == payload["license_id"])
        .first()
    )

    if existing:
        # Jika license key berbeda tetapi license_id sama,
        # jangan izinkan penggantian identitas license.
        if existing.license_key != license_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="License ID sudah terdaftar dengan kode berbeda",
            )

        # License yang sama diaktifkan kembali.
        (
            db.query(License)
            .filter(
                License.id != existing.id,
                License.is_active.is_(True),
            )
            .update(
                {"is_active": False},
                synchronize_session=False,
            )
        )

        existing.is_active = True
        existing.activated_at = existing.activated_at or now

        db.commit()
        db.refresh(existing)

        return {
            "activated": True,
            "license": _serialize_license(existing),
        }

    # 5. Nonaktifkan license aktif sebelumnya
    (
        db.query(License)
        .filter(License.is_active.is_(True))
        .update(
            {"is_active": False},
            synchronize_session=False,
        )
    )

    # 6. Buat license baru dari payload yang sudah diverifikasi
    license = License(
        license_key=license_key,
        license_id=payload["license_id"],
        plan_code=payload["plan_code"],
        plan_name=payload["plan_name"],
        organization_name=payload.get("organization_name"),
        issued_at=issued_at,
        expires_at=expires_at,
        max_users=payload.get("max_users"),
        max_armada=payload.get("max_armada"),
        features=json.dumps(
            payload.get("features", []),
            ensure_ascii=False,
        ),
        is_active=True,
        activated_at=now,
    )

    db.add(license)
    db.commit()
    db.refresh(license)

    return {
        "activated": True,
        "license": _serialize_license(license),
    }


def has_feature(
    db: Session,
    feature_code: str,
) -> bool:

    license = get_active_license(db)

    if not license:
        return False

    features = _parse_features(license.features)

    return feature_code in features


def require_feature(
    db: Session,
    feature_code: str,
) -> None:

    if not has_feature(db, feature_code):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Fitur '{feature_code}' "
                "tidak tersedia pada paket lisensi Anda"
            ),
        )


def check_limit(
    db: Session,
    resource: str,
    current_count: int,
) -> bool:

    license = get_active_license(db)

    if not license:
        return False

    if resource == "users":
        limit = license.max_users

    elif resource == "armada":
        limit = license.max_armada

    else:
        return True

    # None = unlimited
    if limit is None:
        return True

    return current_count < limit