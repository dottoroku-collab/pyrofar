from app.core.security import hash_password
from app.models.user import User, UserRole


def _seed_user(db_session, email: str) -> User:
    from app.models.tenant import Tenant
    tenant = Tenant(name="Test Tenant", slug=f"test-{id(email)}")
    db_session.add(tenant)
    db_session.flush()

    user = User(
        tenant_id=tenant.id,
        nama="Admin Test",
        email=email,
        password_hash=hash_password("Password123!"),
        role=UserRole.administrator,
    )
    db_session.add(user)
    db_session.commit()
    return user


def test_login_sukses(client, db_session):
    _seed_user(db_session, "admin-login-ok@example.com")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin-login-ok@example.com", "password": "Password123!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "administrator"


def test_login_password_salah(client, db_session):
    _seed_user(db_session, "admin-login-fail@example.com")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin-login-fail@example.com", "password": "salah-password"},
    )

    assert response.status_code == 401


def test_login_email_tidak_terdaftar(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tidak-ada@example.com", "password": "apapun"},
    )

    assert response.status_code == 401
