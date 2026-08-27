export type UserRole = 
  | "administrator" 
  | "pimpinan" 
  | "operator_cc" 
  | "operator_lapangan_damkar" 
  | "operator_lapangan_penyelamatan" 
  | "operator_sarpras" 
  | "teknisi" 
  | "operator_pencegahan";

export interface UserAdmin {
  id: number;
  nama: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  is_active: boolean;
  is_superadmin: boolean;
}

export interface UserCreatePayload {
  nama: string;
  email?: string;
  username?: string;
  password?: string;
  role: UserRole;
  is_superadmin?: boolean;
}

export interface UserUpdatePayload {
  nama?: string;
  email?: string;
  username?: string;
  role?: UserRole;
  is_active?: boolean;
  is_superadmin?: boolean;
}
