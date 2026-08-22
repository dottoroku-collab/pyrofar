import { apiClient } from "./client";

export interface DashboardKPI {
  active_volunteers: number;
  trained_volunteers: number;
  communities: number;
  incidents_reported: number;
  average_response: string;
  simulation_count: number;
}

export interface MapMarker {
  id: string;
  type: "relawan" | "fire_boat" | "fire_pump" | "posko" | "pulau" | "incident";
  name: string;
  lat: number;
  lng: number;
}

export interface RelawanDashboardData {
  kpi: DashboardKPI;
  map_data: {
    markers: MapMarker[];
  };
}

export interface Relawan {
  id: string;
  nama: string;
  komunitas?: string;
  biodata?: Record<string, any>;
  skills?: any[];
  trainings?: any[];
  certifications?: any[];
  activity_history?: any[];
  incident_participation?: any[];
  latitude?: string;
  longitude?: string;
  status: "active" | "inactive" | "in_mission";
}

export interface AsetRelawan {
  id: string;
  tipe: "fire_boat" | "fire_pump" | "posko" | "pulau";
  nama: string;
  kapasitas?: string;
  latitude?: string;
  longitude?: string;
  status: "ready" | "maintenance" | "deployed";
}

export async function getRelawanDashboard(): Promise<RelawanDashboardData> {
  const { data } = await apiClient.get<RelawanDashboardData>("/relawan/dashboard");
  return data;
}

// Relawan API
export async function getRelawanList(): Promise<Relawan[]> {
  const { data } = await apiClient.get<Relawan[]>("/relawan/relawan");
  return data;
}

export async function getRelawanById(id: string): Promise<Relawan> {
  const { data } = await apiClient.get<Relawan>(`/relawan/relawan/${id}`);
  return data;
}

export async function createRelawan(payload: Partial<Relawan>): Promise<Relawan> {
  const { data } = await apiClient.post<Relawan>("/relawan/relawan", payload);
  return data;
}

export async function updateRelawan(id: string, payload: Partial<Relawan>): Promise<Relawan> {
  const { data } = await apiClient.put<Relawan>(`/relawan/relawan/${id}`, payload);
  return data;
}

export async function deleteRelawan(id: string): Promise<void> {
  await apiClient.delete(`/relawan/relawan/${id}`);
}

// Aset Relawan API
export async function getAsetRelawanList(): Promise<AsetRelawan[]> {
  const { data } = await apiClient.get<AsetRelawan[]>("/relawan/aset-relawan");
  return data;
}

export async function getAsetRelawanById(id: string): Promise<AsetRelawan> {
  const { data } = await apiClient.get<AsetRelawan>(`/relawan/aset-relawan/${id}`);
  return data;
}

export async function createAsetRelawan(payload: Partial<AsetRelawan>): Promise<AsetRelawan> {
  const { data } = await apiClient.post<AsetRelawan>("/relawan/aset-relawan", payload);
  return data;
}

export async function updateAsetRelawan(id: string, payload: Partial<AsetRelawan>): Promise<AsetRelawan> {
  const { data } = await apiClient.put<AsetRelawan>(`/relawan/aset-relawan/${id}`, payload);
  return data;
}

export async function deleteAsetRelawan(id: string): Promise<void> {
  await apiClient.delete(`/relawan/aset-relawan/${id}`);
}
