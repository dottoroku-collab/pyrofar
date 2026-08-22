from app.models.tenant import Tenant, TenantSettings, TenantStatus  # noqa: F401  — MUST be imported first so FK refs resolve
from app.models.user import User  # noqa: F401
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
from app.models.insiden import Insiden, JenisInsiden, StatusInsiden, insiden_armada
from app.models.inspeksi import InspeksiProteksi, StatusKepatuhan
from app.models.inventaris import Inventaris, KondisiBarang
from app.models.rbac import Role, Permission, user_roles, role_permissions
from app.models.subscription import Subscription, Plan, SubscriptionStatus
from app.models.organization import OrganizationUnit
from app.models.edukasi import Edukasi, EdukasiKategori, EdukasiStatus
from app.models.relawan import Relawan, StatusRelawan
from app.models.aset_relawan import AsetRelawan, StatusAsetRelawan, TipeAsetRelawan

# Phase 1: Tenant models registered. All other models now carry tenant_id.
# Phase 2: Operations, Prevention, Inventory models registered.
from app.models.station import Station
from app.models.komunitas_relawan import KomunitasRelawan
from app.models.pelatihan_relawan import PelatihanRelawan
from app.models.insiden_relawan import InsidenRelawan
from app.models.personnel_tracking import PersonnelTracking  # noqa: F401

from app.models.unit_organisasi import Kompi, Pleton, Regu  # noqa: F401
from app.models.personil import Personil, JabatanPersonil  # noqa: F401
