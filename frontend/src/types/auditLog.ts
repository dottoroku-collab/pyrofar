export interface AuditLogItem {
  id: number;
  user_id: number | null;
  aksi: string;
  entitas: string;
  entitas_id: number | null;
  nilai_sebelum: Record<string, unknown> | null;
  nilai_sesudah: Record<string, unknown> | null;
  waktu: string;
}
