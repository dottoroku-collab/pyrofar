export type StatusArmada =
  | "standby"
  | "sedang_bertugas"
  | "pemeliharaan"
  | "menunggu_sparepart"
  | "rusak_ringan"
  | "rusak_berat"
  | "tidak_aktif"
  | "menunggu_approval";

export type ApprovalStatus = "tidak_perlu" | "pending" | "disetujui" | "ditolak";

export interface ArmadaListItem {
  id: number;
  kode_armada: string;
  nama_armada: string | null;
  jenis_kendaraan_id: number;
  lokasi_saat_ini_id: number | null;
  status_armada: StatusArmada;
  no_polisi: string | null;
}

export interface ArmadaPublic extends ArmadaListItem {
  merk: string | null;
  type: string | null;
  tahun: number | null;
  no_mesin: string | null;
  no_rangka: string | null;
  no_bpkb: string | null;
  tanggal_stnk: string | null;
  kapasitas: string | null;
  status_kepemilikan: string | null;
  qr_code_value: string;
  status_approval: ApprovalStatus;
  created_at: string;
}

export interface ArmadaPayload {
  kode_armada: string;
  nama_armada?: string | null;
  jenis_kendaraan_id: number;
  merk?: string | null;
  type?: string | null;
  tahun?: number | null;
  no_polisi?: string | null;
  no_lambung?: string | null;
  no_mesin?: string | null;
  no_rangka?: string | null;
  no_bpkb?: string | null;
  tanggal_stnk?: string | null;
  kapasitas?: string | null;
  status_kepemilikan?: string | null;
  lokasi_saat_ini_id?: number | null;
}

export const STATUS_KRITIS: StatusArmada[] = ["rusak_berat", "tidak_aktif"];

export interface HistoriLokasi {
  id: number;
  armada_id: number;
  lokasi_lama_id: number | null;
  lokasi_baru_id: number;
  tanggal_pindah: string;
  dipindahkan_oleh: number | null;
  keterangan: string | null;
}

export interface HistoriStatus {
  id: number;
  armada_id: number;
  status_lama: StatusArmada | null;
  status_baru: StatusArmada;
  tanggal: string;
  diajukan_oleh: number | null;
  butuh_approval: boolean;
  approval_status: ApprovalStatus;
  disetujui_oleh: number | null;
  tanggal_approval: string | null;
  catatan_approval: string | null;
  keterangan: string | null;
}

export const STATUS_LABEL: Record<StatusArmada, string> = {
  standby: "Standby",
  sedang_bertugas: "Sedang Bertugas",
  pemeliharaan: "Pemeliharaan",
  menunggu_sparepart: "Menunggu Sparepart",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
  tidak_aktif: "Tidak Aktif",
  menunggu_approval: "Menunggu Approval",
};
