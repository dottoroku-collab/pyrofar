import { apiClient } from "@/api/client";
import type { UserAdmin, UserCreatePayload, UserUpdatePayload } from "@/types/user";

export const usersApi = {
  list: async () => (await apiClient.get<UserAdmin[]>("/users")).data,
  create: async (payload: UserCreatePayload) =>
    (await apiClient.post<UserAdmin>("/users", payload)).data,
  update: async (id: number, payload: UserUpdatePayload) =>
    (await apiClient.put<UserAdmin>(`/users/${id}`, payload)).data,
  remove: async (id: number) => apiClient.delete(`/users/${id}`),
  resetPassword: async (id: number, payload: { new_password: string }) =>
    (await apiClient.put(`/users/${id}/password`, payload)).data,
};
