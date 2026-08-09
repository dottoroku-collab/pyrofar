import { apiClient } from "@/api/client";
import type {
  LicenseActivateRequest,
  LicenseStatusResponse,
} from "@/types/license";

export const licenseApi = {
  get: async (): Promise<LicenseStatusResponse> => {
    const { data } = await apiClient.get<LicenseStatusResponse>(
      "/license"
    );

    return data;
  },

  activate: async (
    payload: LicenseActivateRequest
  ): Promise<LicenseStatusResponse> => {
    const { data } =
      await apiClient.post<LicenseStatusResponse>(
        "/license/activate",
        payload
      );

    return data;
  },
};
