import { useEffect, useState } from "react";
import { settingsApi } from "@/api/settings";
import type { AppSettings } from "@/types/settings";

const DEFAULT_SETTINGS: AppSettings = {
  id: 0,
  app_name: "PYROFAR - Integrated Fire & Rescue Operations Platform",
  app_short_name: "PYROFAR",
  organization_name: "Dinas Pemadam Kebakaran & Penyelamatan",
  region_name: "Kota Makassar",
  logo_url: null,
  primary_color: "#C62828",
  secondary_color: "#263238",
  contact_email: null,
  contact_phone: null,
  address: null,
  latitude: null,
  longitude: null,
  personnel_count: null,
  dashboard_video_url: null,
  dashboard_image_url: null,
  dashboard_running_text: null,
};

let cachedSettings: AppSettings | null = null;

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(
    cachedSettings ?? DEFAULT_SETTINGS
  );
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await settingsApi.get();

        if (mounted) {
          cachedSettings = data;
          setSettings(data);
        }
      } catch (error) {
        console.error("Gagal memuat branding aplikasi:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    settings,
    loading,
  };
}

export function clearAppSettingsCache() {
  cachedSettings = null;
}