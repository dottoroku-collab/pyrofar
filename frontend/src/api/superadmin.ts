import { apiClient as api } from "./client";
import { TenantPublic } from "../types/tenant";
import { UserAdmin } from "../types/user";

export const superadminApi = {
  getTenants: async (): Promise<TenantPublic[]> => {
    const response = await api.get("/superadmin/tenants");
    return response.data;
  },

  createTenant: async (data: Partial<TenantPublic>): Promise<TenantPublic> => {
    const response = await api.post("/superadmin/tenants", data);
    return response.data;
  },

  updateTenant: async (
    id: string,
    data: Partial<TenantPublic>
  ): Promise<TenantPublic> => {
    const response = await api.put(`/superadmin/tenants/${id}`, data);
    return response.data;
  },

  deleteTenant: async (id: string): Promise<void> => {
    await api.delete(`/superadmin/tenants/${id}`);
  },

  getTenantUsers: async (tenantId: string): Promise<UserAdmin[]> => {
    const response = await api.get(`/superadmin/tenants/${tenantId}/users`);
    return response.data;
  },

  generateLicense: async (data: {
    plan_code: string;
    organization_name: string;
    years: number;
  }): Promise<{ license_key: string; license_id: string; expires_at: string }> => {
    const response = await api.post(`/superadmin/licenses/generate`, data);
    return response.data;
  },
};
