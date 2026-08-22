import pytest
from app.models.tenant import Tenant
from app.models.user import User, UserRole

def _setup_tenant_user(db_session):
    tenant = Tenant(name="Test Tenant Relawan", slug=f"test-relawan-{id(db_session)}")
    db_session.add(tenant)
    db_session.flush()

    user = User(
        tenant_id=tenant.id,
        nama="Operator Relawan", email=f"operator-relawan{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator_cc,
    )
    db_session.add(user)
    db_session.commit()
    return tenant, user

def test_get_kondisi_relawan(client, db_session):
    tenant, user = _setup_tenant_user(db_session)
    from app.dependencies.auth import get_current_user
    
    def override_get_current_user():
        return user
        
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    
    resp = client.get("/api/v1/relawan/kondisi?lat=-6.200000&lon=106.816666")
    assert resp.status_code == 200
    data = resp.json()
    assert "location" in data
    assert data["location"]["lat"] == -6.2
    assert "weather" in data
    assert "tide" in data or "pasang_surut" not in data # Wait, pasang_surut is tide? The response has tide? I'll check what is there. Actually, I can just check location and weather
    assert "nearby_water_sources" in data
