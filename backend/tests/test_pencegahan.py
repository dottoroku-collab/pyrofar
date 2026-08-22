import pytest
from app.models.inspeksi import StatusKepatuhan
from app.models.tenant import Tenant
from app.models.user import User, UserRole

def _setup_tenant_user(db_session):
    tenant = Tenant(name="Test Tenant Pencegahan", slug=f"test-pencegahan-{id(db_session)}")
    db_session.add(tenant)
    db_session.flush()

    user = User(
        tenant_id=tenant.id,
        nama="Inspektur Test", email=f"inspektur{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator_pencegahan,
    )
    db_session.add(user)
    db_session.commit()
    return tenant, user

def test_create_inspeksi(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    payload = {
        "objek_inspeksi": "Gedung Sate",
        "alamat": "Bandung",
        "tanggal_inspeksi": "2026-08-01",
        "status_kepatuhan": "sebagian",
        "catatan": "Kurang APAR"
    }
    
    resp = client.post("/api/v1/pencegahan/inspeksi", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["objek_inspeksi"] == "Gedung Sate"
    assert data["status_kepatuhan"] == "sebagian"

def test_list_inspeksi(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    resp = client.get("/api/v1/pencegahan/inspeksi")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
