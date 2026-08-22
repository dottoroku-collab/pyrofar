/** TypeScript types for Tenant and TenantSettings. */

export interface TenantPublic {
  id: string;           // UUID
  name: string;
  slug: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  plan_code: string;
  created_at: string;
}

export interface TenantSettings {
  tenant_id: string;
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
  latitude: number | null;
  longitude: number | null;
  personnel_count: number | null;
  dashboard_video_url: string | null;
  dashboard_image_url: string | null;
  dashboard_running_text: string | null;

  // WhatsApp Gateway Settings
  wa_enabled?: boolean;
  wa_provider?: string;
  wa_api_token?: string | null;
  wa_api_url?: string | null;
  wa_siaga_target?: string | null;
  wa_instance_name?: string | null;

  updated_at: string;
}

export interface TenantMeResponse {
  tenant: TenantPublic;
  settings: TenantSettings;
}

export interface TenantSettingsUpdate {
  app_name?: string;
  app_short_name?: string;
  organization_name?: string | null;
  region_name?: string | null;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  dashboard_video_url?: string | null;
  dashboard_image_url?: string | null;
  dashboard_running_text?: string | null;

  // WhatsApp Gateway Settings
  wa_enabled?: boolean;
  wa_provider?: string;
  wa_api_token?: string | null;
  wa_api_url?: string | null;
  wa_siaga_target?: string | null;
  wa_instance_name?: string | null;
}
