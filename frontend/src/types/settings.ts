export interface AppSettings {
  id: number;

  app_name: string;

  app_short_name: string;

  organization_name: string | null;

  region_name: string | null;

  logo_url: string | null;

  primary_color: string;

  secondary_color: string;

  contact_email: string | null;

  contact_phone: string | null;

  address: string | null;
  
  personnel_count: number | null;

  latitude: number | null;

  longitude: number | null;

  dashboard_video_url: string | null;

  dashboard_image_url: string | null;

  dashboard_running_text: string | null;
}


export type AppSettingsPayload = Omit<
  AppSettings,
  "id" | "logo_url"
>;