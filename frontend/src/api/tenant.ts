import { apiClient } from "./client";
import type { TenantMeResponse, TenantSettingsUpdate, TenantSettings } from "@/types/tenant";

export const getMyTenant = async (): Promise<TenantMeResponse> => {
  const res = await apiClient.get("/tenants/me");
  return res.data;
};

export const getMyTenantSettings = async (): Promise<TenantSettings> => {
  const res = await apiClient.get("/tenants/me/settings");
  return res.data;
};

export const updateMyTenantSettings = async (data: TenantSettingsUpdate): Promise<TenantSettings> => {
  const res = await apiClient.patch("/tenants/me/settings", data);
  return res.data;
};

export const uploadDashboardMedia = async (file: File): Promise<TenantSettings> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post("/tenants/me/settings/media", formData);
  return res.data;
};

export const uploadLogo = async (file: File): Promise<TenantSettings> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post("/tenants/me/settings/logo", formData);
  return res.data;
};

export const testWhatsAppGateway = async (data?: {
  target?: string;
  message?: string;
  provider?: string;
  api_token?: string;
  api_url?: string;
  instance_name?: string;
}) => {
  const res = await apiClient.post("/tenants/me/settings/test-whatsapp", data || {});
  return res.data;
};
