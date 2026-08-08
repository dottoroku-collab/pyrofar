import { apiClient } from "@/api/client";
import type { JenisKendaraan, Lokasi, MasterDataPayload } from "@/types/masterData";

export const jenisKendaraanApi = {
  list: async () => (await apiClient.get<JenisKendaraan[]>("/jenis-kendaraan")).data,
  create: async (payload: MasterDataPayload) =>
    (await apiClient.post<JenisKendaraan>("/jenis-kendaraan", payload)).data,
  update: async (id: number, payload: MasterDataPayload) =>
    (await apiClient.put<JenisKendaraan>(`/jenis-kendaraan/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/jenis-kendaraan/${id}`),
};

export const lokasiApi = {
  list: async () => (await apiClient.get<Lokasi[]>("/lokasi")).data,
  create: async (payload: MasterDataPayload) =>
    (await apiClient.post<Lokasi>("/lokasi", payload)).data,
  update: async (id: number, payload: MasterDataPayload) =>
    (await apiClient.put<Lokasi>(`/lokasi/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/lokasi/${id}`),
};
