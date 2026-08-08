from datetime import date

from sqlalchemy.orm import Session

from app.models.armada import Armada
from app.models.jadwal_servis import JadwalServis
from app.models.user import UserRole
from app.services import notifikasi_service


def cek_dan_kirim_reminder(db: Session) -> int:
    """Dipanggil oleh cron harian (lihat app/jobs/reminder_cron.py).
    Kembalikan jumlah jadwal yang memicu notifikasi.
    """
    today = date.today()
    jadwal_list = db.query(JadwalServis).filter(JadwalServis.status == "aktif").all()

    terkirim = 0
    for jadwal in jadwal_list:
        selisih = (jadwal.tanggal_jatuh_tempo - today).days
        if selisih > jadwal.ambang_hari_reminder:
            continue

        armada = db.query(Armada).filter(Armada.id == jadwal.armada_id, Armada.is_deleted.is_(False)).first()
        if not armada:
            continue

        status_waktu = "terlewat" if selisih < 0 else f"{selisih} hari lagi"
        pesan = (
            f"Armada {armada.kode_armada}: {jadwal.jenis_reminder.value} "
            f"jatuh tempo {jadwal.tanggal_jatuh_tempo} ({status_waktu})"
        )
        for role in (UserRole.administrator, UserRole.operator, UserRole.teknisi):
            notifikasi_service.notify_users_by_role(
                db, role, jenis="reminder", pesan=pesan, armada_id=armada.id
            )
        terkirim += 1

    return terkirim


def sinkronkan_jadwal_stnk(db: Session, armada: Armada) -> JadwalServis | None:
    """Buat/refresh jadwal reminder perpanjangan STNK dari field tanggal_stnk armada.
    Dipanggil setiap kali armada dibuat/diperbarui dengan tanggal_stnk.
    """
    if not armada.tanggal_stnk:
        return None

    existing = (
        db.query(JadwalServis)
        .filter(JadwalServis.armada_id == armada.id, JadwalServis.jenis_reminder == "perpanjangan_stnk")
        .first()
    )
    if existing:
        existing.tanggal_jatuh_tempo = armada.tanggal_stnk
        db.commit()
        db.refresh(existing)
        return existing

    jadwal = JadwalServis(
        armada_id=armada.id,
        jenis_reminder="perpanjangan_stnk",
        tanggal_jatuh_tempo=armada.tanggal_stnk,
        ambang_hari_reminder=30,
    )
    db.add(jadwal)
    db.commit()
    db.refresh(jadwal)
    return jadwal
