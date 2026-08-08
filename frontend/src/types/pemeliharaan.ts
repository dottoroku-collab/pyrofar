export interface Sparepart {
  id: number;
  pemeliharaan_id: number;
  nama_sparepart: string;
  merk: string | null;
  jumlah: number;
  harga: number;
  tanggal_penggantian: string | null;
}

export interface SparepartInput {
  nama_sparepart: string;
  merk?: string;
  jumlah: number;
  harga: number;
  tanggal_penggantian?: string;
}

export type StatusPemeliharaan = "proses" | "selesai";

export interface Pemeliharaan {
  id: number;
  armada_id: number;
  tanggal: string;
  jenis_kendala: string | null;
  kategori: string | null;
  jenis_pekerjaan: string | null;
  nama_montir: string | null;
  vendor: string | null;
  biaya: number;
  jumlah: number;
  keterangan: string | null;
  foto_sebelum_url: string | null;
  foto_sesudah_url: string | null;
  status: StatusPemeliharaan;
  input_oleh: number | null;
  tanggal_input: string;
  sparepart: Sparepart[];
}

export interface PemeliharaanPayload {
  armada_id: number;
  tanggal: string;
  jenis_kendala?: string;
  kategori?: string;
  jenis_pekerjaan?: string;
  nama_montir?: string;
  vendor?: string;
  biaya: number;
  jumlah: number;
  keterangan?: string;
  sparepart: SparepartInput[];
}

export interface TimelineItem {
  tanggal: string;
  jenis: "pendaftaran" | "pindah_lokasi" | "ubah_status" | "pemeliharaan";
  judul: string;
  deskripsi: string | null;
}
