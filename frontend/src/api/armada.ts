import { apiClient } from "@/api/client";
import type { ArmadaListItem, ArmadaPayload, ArmadaPublic, HistoriLokasi, HistoriStatus, StatusArmada, ArmadaFile } from "@/types/armada";

export interface ArmadaFilters {
  q?: string;
  jenis_id?: number;
  lokasi_id?: number;
  status_armada?: string;
  page?: number;
  page_size?: number;
}

export const armadaApi = {
  list: async (filters: ArmadaFilters = {}) =>
    (await apiClient.get<ArmadaListItem[]>("/armada", { params: filters })).data,
  get: async (id: number) => (await apiClient.get<ArmadaPublic>(`/armada/${id}`)).data,
  create: async (payload: ArmadaPayload) =>
    (await apiClient.post<ArmadaPublic>("/armada", payload)).data,
  update: async (id: number, payload: Partial<ArmadaPayload>) =>
    (await apiClient.put<ArmadaPublic>(`/armada/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/armada/${id}`),
  listFiles: async (id: number) =>
    (await apiClient.get<ArmadaFile[]>(`/armada/${id}/files`)).data,
  uploadFile: async (id: number, jenisFile: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/armada/${id}/files?jenis_file=${jenisFile}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  pindahLokasi: async (id: number, lokasiBaruId: number, keterangan?: string) =>
    (
      await apiClient.post<HistoriLokasi>(`/armada/${id}/pindah-lokasi`, {
        lokasi_baru_id: lokasiBaruId,
        keterangan,
      })
    ).data,
  historiLokasi: async (id: number) =>
    (await apiClient.get<HistoriLokasi[]>(`/armada/${id}/histori-lokasi`)).data,
  ubahStatus: async (id: number, statusBaru: StatusArmada, keterangan?: string) =>
    (
      await apiClient.put<HistoriStatus>(`/armada/${id}/status`, {
        status_baru: statusBaru,
        keterangan,
      })
    ).data,
};
