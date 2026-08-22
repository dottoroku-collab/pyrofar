import { apiClient } from "./client";

export interface Station {
  id: string;
  nama: string;
  alamat?: string;
  latitude?: number;
  longitude?: number;
  kapasitas_personil?: number;
  is_relawan_post: boolean;
  created_at: string;
  updated_at: string;
}

export const getStations = async (is_relawan_post?: boolean) => {
  const params = is_relawan_post !== undefined ? { is_relawan_post } : {};
  const res = await apiClient.get<Station[]>("/stations", { params });
  return res.data;
};

export const createStation = async (data: Partial<Station>) => {
  const res = await apiClient.post<Station>("/stations", data);
  return res.data;
};

export const updateStation = async (id: string, data: Partial<Station>) => {
  const res = await apiClient.patch<Station>(`/stations/${id}`, data);
  return res.data;
};

export const deleteStation = async (id: string) => {
  const res = await apiClient.delete(`/stations/${id}`);
  return res.data;
};
