import { apiClient } from "@/api/client";
import type { LoginPayload, TokenResponse, UserPublic } from "@/types/auth";

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function fetchMe(): Promise<UserPublic> {
  const { data } = await apiClient.get<UserPublic>("/auth/me");
  return data;
}
