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
