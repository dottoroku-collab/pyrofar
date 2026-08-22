import pytest
from app.models.insiden import JenisInsiden, StatusInsiden
from app.models.tenant import Tenant
from app.models.user import User, UserRole

def _setup_tenant_user(db_session):
    tenant = Tenant(name="Test Tenant Insiden", slug=f"test-insiden-{id(db_session)}")
    db_session.add(tenant)
    db_session.flush()

    user = User(
        tenant_id=tenant.id,
        nama="Operator Insiden", email=f"operator-insiden{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator_cc,
    )
    db_session.add(user)
    db_session.commit()
    return tenant, user

def test_create_insiden(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    payload = {
        "jenis_insiden": "pemadaman",
        "kategori": "Kebakaran Rumah",
        "objek": "Rumah Warga",
        "alamat": "Jl. Merdeka No 1",
        "pelapor_nama": "Budi",
        "pelapor_kontak": "08123456789"
    }
    
    resp = client.post("/api/v1/insiden/", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["jenis_insiden"] == "pemadaman"
    assert data["status"] == "menunggu"

def test_list_insiden(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    resp = client.get("/api/v1/insiden/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
