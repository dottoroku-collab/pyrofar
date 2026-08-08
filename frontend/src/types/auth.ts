export type UserRole = "administrator" | "pimpinan" | "kabid" | "operator" | "teknisi";

export interface UserPublic {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
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
