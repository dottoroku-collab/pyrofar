import { create } from "zustand";
import { licenseApi } from "@/api/license";
import type { LicenseInfo } from "@/types/license";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

interface LicenseState {
  license: LicenseInfo | null;
  isActive: boolean;
  loading: boolean;
  fetched: boolean;
  fetchLicense: () => Promise<void>;
  clear: () => void;
}

const useLicenseStore = create<LicenseState>((set, get) => ({
  license: null,
  isActive: false,
  loading: false,
  fetched: false,
  fetchLicense: async () => {
    // Prevent concurrent fetches
    if (get().loading || get().fetched) return;

    set({ loading: true });
    try {
      const data = await licenseApi.get();
      set({
        license: data.license,
        isActive: data.activated,
        loading: false,
        fetched: true
      });
    } catch (error) {
      console.error("Gagal memuat data lisensi:", error);
      set({
        license: null,
        isActive: false,
        loading: false,
        fetched: true // Mark as fetched even on error to stop infinite loading
      });
    }
  },
  clear: () => set({ license: null, isActive: false, loading: false, fetched: false }),
}));

export function useLicense() {
  const license = useLicenseStore((s) => s.license);
  const isActive = useLicenseStore((s) => s.isActive);
  const loading = useLicenseStore((s) => s.loading);
  const fetched = useLicenseStore((s) => s.fetched);
  const fetchLicense = useLicenseStore((s) => s.fetchLicense);

  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  useEffect(() => {
    if (!isAuthenticated) {
      if (fetched || loading) {
        useLicenseStore.getState().clear();
      }
      return;
    }

    if (!fetched && !loading && isAuthenticated) {
      fetchLicense();
    }
  }, [isAuthenticated, fetched, loading, fetchLicense]);

  const hasFeature = (feature: string) => {
    if (!isActive || !license) return false;
    return license.features.includes(feature);
  };

  return {
    license,
    isActive,
    loading: loading || !fetched,
    hasFeature,
  };
}

export function clearLicenseCache() {
  useLicenseStore.getState().clear();
}
