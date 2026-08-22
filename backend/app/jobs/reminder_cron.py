from apscheduler.schedulers.background import BackgroundScheduler

from app.core.database import SessionLocal
from app.services.reminder_service import cek_dan_kirim_reminder

scheduler = BackgroundScheduler()


def _job() -> None:
    db = SessionLocal()
    try:
        jumlah = cek_dan_kirim_reminder(db)
        print(f"[reminder_cron] {jumlah} jadwal memicu notifikasi reminder")
    finally:
        db.close()


def start_scheduler() -> None:
    """Dipanggil sekali saat aplikasi FastAPI start (lihat app/main.py)."""
    scheduler.add_job(_job, "cron", hour=6, minute=0, id="reminder_harian", replace_existing=True)
    if not scheduler.running:
        scheduler.start()
