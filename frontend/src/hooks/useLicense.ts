import { useEffect, useState } from "react";
import { licenseApi } from "@/api/license";
import type { LicenseInfo } from "@/types/license";
import { useAuthStore } from "@/store/authStore";

let cachedLicense: LicenseInfo | null = null;
let cachedIsActive: boolean = false;

export function useLicense() {
  const [license, setLicense] = useState<LicenseInfo | null>(cachedLicense);
  const [isActive, setIsActive] = useState<boolean>(cachedIsActive);
  const [loading, setLoading] = useState(!cachedLicense);

  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // Don't try to fetch license if not authenticated
      if (!isAuthenticated) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const data = await licenseApi.get();
        if (mounted) {
          cachedLicense = data.license;
          cachedIsActive = data.activated;
          setLicense(data.license);
          setIsActive(data.activated);
        }
      } catch (error) {
        console.error("Gagal memuat data lisensi:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Only load if not cached yet
    if (!cachedLicense && isAuthenticated) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const hasFeature = (feature: string) => {
    if (!isActive || !license) return false;
    return license.features.includes(feature);
  };

  return {
    license,
    isActive,
    loading,
    hasFeature,
  };
}

export function clearLicenseCache() {
  cachedLicense = null;
  cachedIsActive = false;
}
