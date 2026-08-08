import { apiClient } from "@/api/client";
import type { Notifikasi } from "@/types/notifikasi";

export const notifikasiApi = {
  list: async () => (await apiClient.get<Notifikasi[]>("/notifikasi")).data,
  markRead: async (id: number) => (await apiClient.put<Notifikasi>(`/notifikasi/${id}/read`)).data,
};
