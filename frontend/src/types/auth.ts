export type UserRole = 
  | "administrator" 
  | "pimpinan" 
  | "operator_cc" 
  | "operator_lapangan_damkar" 
  | "operator_lapangan_penyelamatan" 
  | "operator_sarpras" 
  | "teknisi" 
  | "operator_pencegahan";

export interface UserPublic {
  id: number;
  tenant_id: string;  // UUID string — added in Phase 1 multi-tenant
  nama: string;
  email: string;
  role: UserRole;
  is_superadmin?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserPublic;
}

export interface LoginPayload {
  email: string;
  password: string;
}
