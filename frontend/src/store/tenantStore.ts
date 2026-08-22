import { create } from "zustand";
import type { TenantPublic, TenantSettings } from "@/types/tenant";
import { getMyTenant } from "@/api/tenant";

interface TenantState {
  tenant: TenantPublic | null;
  settings: TenantSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchTenant: () => Promise<void>;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenant: null,
  settings: null,
  isLoading: false,
  error: null,

  fetchTenant: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getMyTenant();
      set({ tenant: data.tenant, settings: data.settings, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Gagal memuat data tenant", isLoading: false });
    }
  },

  clearTenant: () => {
    set({ tenant: null, settings: null, error: null });
  },
}));
