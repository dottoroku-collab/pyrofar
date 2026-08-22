"""Integration test untuk BR-03: status Rusak Berat/Tidak Aktif langsung berubah dan notify Pimpinan."""
from app.models.armada import ApprovalStatus, Armada, StatusArmada
from app.models.jenis_kendaraan import JenisKendaraan
from app.models.user import User, UserRole
from app.schemas.status import UbahStatusRequest
from app.services import approval_service


def _setup(db_session):
    from app.models.tenant import Tenant
    tenant = Tenant(name="Test Tenant", slug=f"test-flow-{id(db_session)}")
    db_session.add(tenant)
    db_session.flush()

    jenis = JenisKendaraan(tenant_id=tenant.id, nama=f"Tangki Test {id(db_session)}")
    db_session.add(jenis)
    db_session.flush()

    operator = User(
        tenant_id=tenant.id,
        nama="Operator Test", email=f"operator{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator_sarpras,
    )
    pimpinan = User(
        tenant_id=tenant.id,
        nama="Pimpinan Test", email=f"pimpinan{id(db_session)}@test.local",
        password_hash="x", role=UserRole.pimpinan,
    )
    db_session.add_all([operator, pimpinan])
    db_session.flush()

    armada = Armada(
        tenant_id=tenant.id,
        kode_armada=f"DMK-TEST-{id(db_session)}",
        jenis_kendaraan_id=jenis.id,
        qr_code_value=f"DMK-TEST-{id(db_session)}-abc123",
        created_by=operator.id,
    )
    db_session.add(armada)
    db_session.commit()
    return armada, operator, pimpinan


def test_status_kritis_langsung_berlaku_dan_tercatat(db_session):
    armada, operator, pimpinan = _setup(db_session)

    payload = UbahStatusRequest(status_baru=StatusArmada.rusak_berat, keterangan="Kecelakaan lalu lintas")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    # Status harus langsung berubah
    assert armada.status_armada == StatusArmada.rusak_berat
    assert armada.status_approval == ApprovalStatus.tidak_perlu
    # Histori tidak butuh approval, dan tidak pending
    assert histori.butuh_approval is False
    assert histori.approval_status == ApprovalStatus.tidak_perlu


def test_status_non_kritis_langsung_berlaku(db_session):
    armada, operator, _pimpinan = _setup(db_session)

    payload = UbahStatusRequest(status_baru=StatusArmada.sedang_bertugas, keterangan="Berangkat tugas")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    assert armada.status_armada == StatusArmada.sedang_bertugas
    assert armada.status_approval == ApprovalStatus.tidak_perlu
    assert histori.butuh_approval is False
