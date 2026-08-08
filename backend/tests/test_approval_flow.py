"""Integration test untuk BR-03: status Rusak Berat/Tidak Aktif wajib approval Kabid."""
from app.models.armada import ApprovalStatus, Armada, StatusArmada
from app.models.jenis_kendaraan import JenisKendaraan
from app.models.user import User, UserRole
from app.schemas.status import UbahStatusRequest
from app.services import approval_service


def _setup(db_session):
    jenis = JenisKendaraan(nama=f"Tangki Test {id(db_session)}")
    db_session.add(jenis)
    db_session.flush()

    operator = User(
        nama="Operator Test", email=f"operator{id(db_session)}@test.local",
        password_hash="x", role=UserRole.operator,
    )
    kabid = User(
        nama="Kabid Test", email=f"kabid{id(db_session)}@test.local",
        password_hash="x", role=UserRole.kabid,
    )
    db_session.add_all([operator, kabid])
    db_session.flush()

    armada = Armada(
        kode_armada=f"DMK-TEST-{id(db_session)}",
        jenis_kendaraan_id=jenis.id,
        qr_code_value=f"DMK-TEST-{id(db_session)}-abc123",
        created_by=operator.id,
    )
    db_session.add(armada)
    db_session.commit()
    return armada, operator, kabid


def test_status_kritis_masuk_menunggu_approval(db_session):
    armada, operator, _kabid = _setup(db_session)

    payload = UbahStatusRequest(status_baru=StatusArmada.rusak_berat, keterangan="Kecelakaan lalu lintas")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    assert armada.status_armada == StatusArmada.menunggu_approval
    assert armada.status_approval == ApprovalStatus.pending
    assert histori.butuh_approval is True
    assert histori.approval_status == ApprovalStatus.pending


def test_kabid_approve_status_kritis_berlaku_efektif(db_session):
    armada, operator, kabid = _setup(db_session)
    payload = UbahStatusRequest(status_baru=StatusArmada.rusak_berat, keterangan="Kecelakaan")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    approved = approval_service.approve(db_session, histori.id, kabid)

    assert armada.status_armada == StatusArmada.rusak_berat
    assert armada.status_approval == ApprovalStatus.disetujui
    assert approved.approval_status == ApprovalStatus.disetujui
    assert approved.disetujui_oleh == kabid.id


def test_kabid_reject_status_kritis_kembali_ke_status_semula(db_session):
    armada, operator, kabid = _setup(db_session)
    status_awal = armada.status_armada
    payload = UbahStatusRequest(status_baru=StatusArmada.tidak_aktif, keterangan="Diajukan pensiun")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    rejected = approval_service.reject(db_session, histori.id, "Belum ada bukti pendukung", kabid)

    assert armada.status_armada == status_awal
    assert armada.status_approval == ApprovalStatus.tidak_perlu
    assert rejected.approval_status == ApprovalStatus.ditolak
    assert rejected.catatan_approval == "Belum ada bukti pendukung"


def test_status_non_kritis_langsung_berlaku_tanpa_approval(db_session):
    armada, operator, _kabid = _setup(db_session)

    payload = UbahStatusRequest(status_baru=StatusArmada.sedang_bertugas, keterangan="Berangkat tugas")
    histori = approval_service.ubah_status(db_session, armada, payload, operator)

    assert armada.status_armada == StatusArmada.sedang_bertugas
    assert armada.status_approval == ApprovalStatus.tidak_perlu
    assert histori.butuh_approval is False
