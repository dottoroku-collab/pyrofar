import { apiClient } from "@/api/client";
import type { AuditLogItem } from "@/types/auditLog";

export const auditLogApi = {
  list: async (filters: { user_id?: number; entitas?: string; page?: number } = {}) =>
    (await apiClient.get<AuditLogItem[]>("/audit-log", { params: filters })).data,
};
