export interface PublicServisTerakhir {
  tanggal: string;
  jenis_pekerjaan: string | null;
}

export interface PublicArmada {
  kode_armada: string;
  jenis: string | null;
  merk_type: string | null;
  no_polisi: string | null;
  status_armada: string;
  foto_url: string | null;
  servis_terakhir: PublicServisTerakhir | null;
}
