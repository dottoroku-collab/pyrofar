import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import HTTPException, status
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

# Hardcode or import plans
PLANS = {
    "BASIC": {
        "name": "SIM Armada Basic",
        "max_users": 10,
        "max_armada": 20,
        "features": ["tracking", "maintenance_basic", "reports_basic"],
    },
    "PRO": {
        "name": "SIM Armada Pro",
        "max_users": 50,
        "max_armada": 100,
        "features": [
            "tracking",
            "maintenance_pro",
            "reports_pro",
            "routing",
            "alerting",
        ],
    },
    "ENTERPRISE": {
        "name": "SIM Armada Enterprise",
        "max_users": None,  # Unlimited
        "max_armada": None,  # Unlimited
        "features": [
            "tracking",
            "maintenance_enterprise",
            "reports_enterprise",
            "routing",
            "alerting",
            "api_access",
            "custom_branding",
            "sso",
        ],
    },
}

BASE_DIR = Path(__file__).resolve().parents[1]
PRIVATE_KEY_FILE = BASE_DIR / "core" / "keys" / "license_private_key.pem"


def load_private_key():
    if not PRIVATE_KEY_FILE.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Private key untuk generate lisensi tidak ditemukan di server.",
        )
    return serialization.load_pem_private_key(
        PRIVATE_KEY_FILE.read_bytes(),
        password=None,
    )


def canonical_json(data):
    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def generate_license_key(plan_code: str, organization_name: str, years: int = 1) -> dict:
    if plan_code not in PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Paket lisensi tidak valid",
        )
        
    plan = PLANS[plan_code]
    now = datetime.now(timezone.utc).replace(microsecond=0)
    expires_at = now + timedelta(days=365 * years)

    license_id = (
        f"SIM-ARMADA-{now.year}-"
        f"{secrets.token_hex(4).upper()}"
    )

    payload = {
        "license_id": license_id,
        "plan_code": plan_code,
        "plan_name": plan["name"],
        "organization_name": organization_name,
        "issued_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "max_users": plan["max_users"],
        "max_armada": plan["max_armada"],
        "features": plan["features"],
    }

    private_key = load_private_key()

    payload_bytes = canonical_json(payload)
    signature = private_key.sign(payload_bytes)

    payload_encoded = base64.urlsafe_b64encode(
        payload_bytes
    ).decode("ascii").rstrip("=")

    signature_encoded = base64.urlsafe_b64encode(
        signature
    ).decode("ascii").rstrip("=")

    license_key = (
        f"SAM1."
        f"{payload_encoded}."
        f"{signature_encoded}"
    )

    return {
        "license_key": license_key,
        "license_id": license_id,
        "expires_at": payload["expires_at"]
    }
