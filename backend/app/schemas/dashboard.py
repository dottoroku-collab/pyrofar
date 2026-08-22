from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_armada: int
    standby: int
    sedang_bertugas: int
    rusak: int
    pemeliharaan: int
    menunggu_approval: int
    tidak_aktif: int
    availability_pct: float
    biaya_maintenance_bulan_ini: float


class PerPostoItem(BaseModel):
    lokasi_id: int | None
    lokasi_nama: str
    jumlah: int


class PerJenisItem(BaseModel):
    jenis_id: int
    jenis_nama: str
    jumlah: int


class TrenMaintenanceItem(BaseModel):
    bulan: str
    jumlah_pemeliharaan: int
    total_biaya: float


class AnalyticsMTBFMTTR(BaseModel):
    armada_id: int
    kode_armada: str
    mtbf_hari: float | None
    mttr_jam: float | None


class CostPerVehicleItem(BaseModel):
    armada_id: int
    kode_armada: str
    jumlah_pemeliharaan: int
    total_biaya: float


class RankingItem(BaseModel):
    armada_id: int
    kode_armada: str
    jumlah_pemeliharaan: int
    total_biaya: float


# --- Incident Analytics ---

class KPIInsiden(BaseModel):
    total_insiden: int
    insiden_aktif: int
    insiden_selesai: int
    unit_tersedia: int

class InsidenPerKecamatan(BaseModel):
    kecamatan: str
    jumlah: int

class InsidenPerJenis(BaseModel):
    jenis: str
    jumlah: int

class TrenWaktuRespons(BaseModel):
    waktu: str  # Format: "Jan", "Feb", etc. or Date string
    rata_rata_menit: float

class DistribusiPerJam(BaseModel):
    jam: str  # Format "01:00", "02:00", etc.
    jumlah: int

class AIRecommendation(BaseModel):
    title: str
    description: str
    type: str # 'warning', 'info', 'success'

class IncidentAnalyticsResponse(BaseModel):
    kpi: KPIInsiden
    per_kecamatan: list[InsidenPerKecamatan]
    per_jenis: list[InsidenPerJenis]
    tren_respons: list[TrenWaktuRespons]
    distribusi_jam: list[DistribusiPerJam]
    recommendations: list[AIRecommendation]
