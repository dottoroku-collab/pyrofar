export type UserRole = "administrator" | "pimpinan" | "kabid" | "operator" | "teknisi";

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
