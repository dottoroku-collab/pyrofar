import { apiClient } from "./client";

export interface InventarisItem {
  id: string;
  nama_barang: string;
  kategori: string;
  tipe_barang: 'equipment' | 'asset' | 'consumable';
  jumlah: number;
  kondisi: string;
  lokasi_id?: string;
  armada_id?: string;
  metadata_tambahan?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const getInventaris = async (tipe_barang?: string) => {
  const params = tipe_barang ? { tipe_barang } : {};
  const res = await apiClient.get<InventarisItem[]>("/sarana/inventaris", { params });
  return res.data;
};

export const createInventaris = async (data: Partial<InventarisItem>) => {
  const res = await apiClient.post<InventarisItem>("/sarana/inventaris", data);
  return res.data;
};
