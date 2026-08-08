import { apiClient } from "@/api/client";
import type { PublicArmada } from "@/types/public";

export const publicApi = {
  getArmada: async (qrCodeValue: string) =>
    (await apiClient.get<PublicArmada>(`/public/armada/${qrCodeValue}`)).data,
};
