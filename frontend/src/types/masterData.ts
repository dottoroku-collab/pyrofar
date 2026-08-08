export interface JenisKendaraan {
  id: number;
  nama: string;
  deskripsi: string | null;
}

export interface Lokasi {
  id: number;
  nama: string;
  deskripsi: string | null;
}

export interface MasterDataPayload {
  nama: string;
  deskripsi?: string | null;
}
