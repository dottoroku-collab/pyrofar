import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from plans import PLANS


BASE_DIR = Path(__file__).resolve().parent
PRIVATE_KEY_FILE = BASE_DIR / "private_key.pem"


def load_or_create_private_key():
    if PRIVATE_KEY_FILE.exists():
        return serialization.load_pem_private_key(
            PRIVATE_KEY_FILE.read_bytes(),
            password=None,
        )

    key = Ed25519PrivateKey.generate()

    PRIVATE_KEY_FILE.write_bytes(
        key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )

    print("Private key baru dibuat:")
    print(PRIVATE_KEY_FILE)

    return key


def canonical_json(data):
    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def generate_license():
    print("\n=== SIM ARMADA LICENSE GENERATOR ===\n")

    print("Paket:")
    print("1. BASIC")
    print("2. PRO")
    print("3. ENTERPRISE")

    choice = input("\nPilih paket [1-3]: ").strip()

    plan_map = {
        "1": "BASIC",
        "2": "PRO",
        "3": "ENTERPRISE",
    }

    plan_code = plan_map.get(choice)

    if not plan_code:
        raise SystemExit("Paket tidak valid.")

    plan = PLANS[plan_code]

    organization_name = input(
        "Nama organisasi: "
    ).strip()

    if not organization_name:
        raise SystemExit("Nama organisasi wajib diisi.")

    years = input(
        "Masa berlaku (tahun) [1]: "
    ).strip()

    years = int(years or "1")

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

    private_key = load_or_create_private_key()

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

    output_file = BASE_DIR / f"{license_id}.json"

    output = {
        "license_key": license_key,
        **payload,
    }

    output_file.write_text(
        json.dumps(
            output,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print("\n========================================")
    print("LICENSE BERHASIL DIBUAT")
    print("========================================")
    print(f"License ID   : {license_id}")
    print(f"Paket        : {plan['name']}")
    print(f"Organisasi   : {organization_name}")
    print(f"Berlaku      : {now.date()} s/d {expires_at.date()}")
    print(
        f"Max Users    : "
        f"{plan['max_users'] if plan['max_users'] else 'Unlimited'}"
    )
    print(
        f"Max Armada   : "
        f"{plan['max_armada'] if plan['max_armada'] else 'Unlimited'}"
    )

    print("\nLICENSE KEY:")
    print("----------------------------------------")
    print(license_key)
    print("----------------------------------------")

    print(f"\nDetail tersimpan:")
    print(output_file)


if __name__ == "__main__":
    generate_license()