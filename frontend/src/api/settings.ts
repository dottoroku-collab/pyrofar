import { apiClient } from "@/api/client";
import type {
  AppSettings,
  AppSettingsPayload,
} from "@/types/settings";

export const settingsApi = {
  get: async (): Promise<AppSettings> => {
    const { data } = await apiClient.get<AppSettings>(
      "/settings"
    );

    return data;
  },

  update: async (
    payload: AppSettingsPayload
  ): Promise<AppSettings> => {
    const { data } = await apiClient.put<AppSettings>(
      "/settings",
      payload
    );

    return data;
  },

  uploadLogo: async (
    file: File
  ): Promise<AppSettings> => {
    const formData = new FormData();

    formData.append("file", file);

    const { data } = await apiClient.post<AppSettings>(
      "/settings/logo",
      formData
    );

    return data;
  },

  deleteLogo: async (): Promise<AppSettings> => {
    const { data } = await apiClient.delete<AppSettings>(
      "/settings/logo"
    );

    return data;
  },
};