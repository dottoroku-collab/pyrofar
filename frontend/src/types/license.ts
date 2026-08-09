export interface LicenseInfo {
  id: number;
  license_id: string;
  plan_code: string;
  plan_name: string;
  organization_name: string | null;
  issued_at: string;
  expires_at: string;
  max_users: number | null;
  max_armada: number | null;
  features: string[];
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

export interface LicenseStatusResponse {
  activated: boolean;
  license: LicenseInfo | null;
}

export interface LicenseActivateRequest {
  license_key: string;
}
