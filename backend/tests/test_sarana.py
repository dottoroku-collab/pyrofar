import pytest
from app.models.inventaris import KondisiBarang
from app.models.tenant import Tenant
from app.models.user import User, UserRole

def _setup_tenant_user(db_session):
    tenant = Tenant(name="Test Tenant Sarana", slug=f"test-sarana-{id(db_session)}")
    db_session.add(tenant)
    db_session.flush()

    user = User(
        tenant_id=tenant.id,
        nama="Operator Sarana", email=f"operator-sarana{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator_sarpras,
    )
    db_session.add(user)
    db_session.commit()
    return tenant, user

def test_create_inventaris(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    payload = {
        "nama_barang": "Selang Air 50m",
        "kategori": "Pemadam",
        "jumlah": 5,
        "kondisi": "baik"
    }
    
    resp = client.post("/api/v1/sarana/inventaris", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["nama_barang"] == "Selang Air 50m"
    assert data["jumlah"] == 5

def test_list_inventaris(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.tenant import get_tenant_context, TenantContext
    
    def override_get_tenant_context():
        return TenantContext(tenant=tenant, user=user)
        
    client.app.dependency_overrides[get_tenant_context] = override_get_tenant_context
    
    resp = client.get("/api/v1/sarana/inventaris")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
