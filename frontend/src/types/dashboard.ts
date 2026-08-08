export interface DashboardSummary {
  total_armada: number;
  standby: number;
  sedang_bertugas: number;
  rusak: number;
  pemeliharaan: number;
  menunggu_approval: number;
  tidak_aktif: number;
  availability_pct: number;
  biaya_maintenance_bulan_ini: number;
}

export interface PerPostoItem {
  lokasi_id: number | null;
  lokasi_nama: string;
  jumlah: number;
}

export interface PerJenisItem {
  jenis_id: number;
  jenis_nama: string;
  jumlah: number;
}

export interface TrenMaintenanceItem {
  bulan: string;
  jumlah_pemeliharaan: number;
  total_biaya: number;
}

export interface RankingItem {
  armada_id: number;
  kode_armada: string;
  jumlah_pemeliharaan: number;
  total_biaya: number;
}
