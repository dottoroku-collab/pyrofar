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
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserCreatePayload {
  nama: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdatePayload {
  nama?: string;
  role?: UserRole;
  is_active?: boolean;
}
