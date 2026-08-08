import { apiClient } from "@/api/client";
import type {
  DashboardSummary,
  PerJenisItem,
  PerPostoItem,
  RankingItem,
  TrenMaintenanceItem,
} from "@/types/dashboard";

export const dashboardApi = {
  summary: async () => (await apiClient.get<DashboardSummary>("/dashboard/summary")).data,
  perPosko: async () => (await apiClient.get<PerPostoItem[]>("/dashboard/per-posko")).data,
  perJenis: async () => (await apiClient.get<PerJenisItem[]>("/dashboard/per-jenis")).data,
  trenMaintenance: async (bulan = 12) =>
    (await apiClient.get<TrenMaintenanceItem[]>("/dashboard/tren-maintenance", { params: { bulan } }))
      .data,
};

export const analyticsApi = {
  ranking: async (tipe: "terburuk" | "terbaik" = "terburuk") =>
    (await apiClient.get<RankingItem[]>("/analytics/ranking", { params: { tipe } })).data,
};
