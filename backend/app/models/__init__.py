from app.models.user import User, UserRole  # noqa: F401
from app.models.jenis_kendaraan import JenisKendaraan  # noqa: F401
from app.models.lokasi import Lokasi  # noqa: F401
from app.models.armada import Armada, StatusArmada, ApprovalStatus  # noqa: F401
from app.models.armada_file import ArmadaFile, JenisFileArmada  # noqa: F401
from app.models.histori_lokasi import HistoriLokasi  # noqa: F401
from app.models.histori_status import HistoriStatus  # noqa: F401
from app.models.notifikasi import Notifikasi  # noqa: F401
from app.models.pemeliharaan import Pemeliharaan, StatusPemeliharaan  # noqa: F401
from app.models.sparepart import Sparepart  # noqa: F401
from app.models.jadwal_servis import JadwalServis, JenisReminder  # noqa: F401
from app.models.audit_log import AuditLog, AuditAksi  # noqa: F401
from app.models.app_settings import AppSettings
from app.models.license import License
# Seluruh entitas ERD Tahap 5 sudah terdaftar.
