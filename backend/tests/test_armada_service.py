"""Unit test murni (tanpa DB) untuk aturan hapus FR-26."""
from app.models.armada import Armada
from app.models.user import User, UserRole
from app.services.armada_service import can_delete


def _make_user(role: UserRole, user_id: int) -> User:
    from uuid import uuid4
    user = User(tenant_id=uuid4(), nama="Test User", email=f"test{user_id}@example.com", password_hash="x", role=role)
    user.id = user_id
    return user


def test_admin_boleh_hapus_armada_siapa_saja():
    from uuid import uuid4
    admin = _make_user(UserRole.administrator, user_id=1)
    armada = Armada(tenant_id=uuid4(), kode_armada="DMK-001", jenis_kendaraan_id=1, created_by=99, qr_code_value="x")

    assert can_delete(armada, admin) is True


def test_operator_hanya_boleh_hapus_armada_miliknya_sendiri():
    from uuid import uuid4
    operator = _make_user(UserRole.operator_sarpras, user_id=5)
    t_id = uuid4()
    armada_milik_sendiri = Armada(
        tenant_id=t_id, kode_armada="DMK-002", jenis_kendaraan_id=1, created_by=5, qr_code_value="x"
    )
    armada_orang_lain = Armada(
        tenant_id=t_id, kode_armada="DMK-003", jenis_kendaraan_id=1, created_by=6, qr_code_value="x"
    )

    assert can_delete(armada_milik_sendiri, operator) is True
    assert can_delete(armada_orang_lain, operator) is False
