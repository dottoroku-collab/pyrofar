import { apiClient } from "@/api/client";
import type { HistoriStatus } from "@/types/armada";

export const approvalApi = {
  listPending: async () => (await apiClient.get<HistoriStatus[]>("/approval")).data,
  approve: async (historiStatusId: number) =>
    (await apiClient.post<HistoriStatus>(`/approval/${historiStatusId}/approve`)).data,
  reject: async (historiStatusId: number, catatanApproval: string) =>
    (
      await apiClient.post<HistoriStatus>(`/approval/${historiStatusId}/reject`, {
        catatan_approval: catatanApproval,
      })
    ).data,
};
