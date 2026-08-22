import { apiClient } from "@/api/client";
import type { Pemeliharaan, PemeliharaanPayload, TimelineItem } from "@/types/pemeliharaan";

export const pemeliharaanApi = {
  list: async (armadaId?: number) =>
    (await apiClient.get<Pemeliharaan[]>("/pemeliharaan", { params: { armada_id: armadaId } })).data,
  get: async (id: number) =>
    (await apiClient.get<Pemeliharaan>(`/pemeliharaan/${id}`)).data,
  create: async (payload: PemeliharaanPayload) =>
    (await apiClient.post<Pemeliharaan>("/pemeliharaan", payload)).data,
  update: async (id: number, payload: Partial<PemeliharaanPayload>) =>
    (await apiClient.put<Pemeliharaan>(`/pemeliharaan/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/pemeliharaan/${id}`),
  uploadFotoSebelum: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/pemeliharaan/${id}/foto-sebelum`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadFotoSesudah: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/pemeliharaan/${id}/foto-sesudah`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const timelineApi = {
  get: async (armadaId: number) =>
    (await apiClient.get<TimelineItem[]>(`/armada/${armadaId}/timeline`)).data,
};
