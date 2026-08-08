export interface Notifikasi {
  id: number;
  armada_id: number | null;
  jenis: string | null;
  pesan: string | null;
  is_read: boolean;
  created_at: string;
}
