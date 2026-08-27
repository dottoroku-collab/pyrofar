import { apiClient } from "./client";

export interface ArmadaInfo {
  id: number;
  nama_armada?: string;
  no_polisi?: string;
  jenis_kendaraan_id?: number;
}

export interface OperatorLapangan {
  id: number;
  tenant_id: string;
  user_id: number;
  nip_nik: string;
  foto_url?: string;
  sim_file_url?: string;
  sim_expiry_date?: string;
  nama: string;
  role: string;
  armada?: ArmadaInfo;
  created_at: string;
  updated_at: string;
}

export interface OperatorLapanganCreate {
  nip_nik: string;
  nama: string;
  role: string;
  password?: string;
  foto_url?: string;
  sim_file_url?: string;
  sim_expiry_date?: string;
  armada_id?: number;
}

export interface OperatorLapanganUpdate {
  nama?: string;
  role?: string;
  password?: string;
  foto_url?: string;
  sim_file_url?: string;
  sim_expiry_date?: string;
  armada_id?: number;
}

export const getOperators = async () => {
  const { data } = await apiClient.get<OperatorLapangan[]>("/operator-lapangan/");
  return data;
};

export const getOperator = async (id: number) => {
  const { data } = await apiClient.get<OperatorLapangan>(`/operator-lapangan/${id}`);
  return data;
};

export const createOperator = async (payload: OperatorLapanganCreate) => {
  const { data } = await apiClient.post<OperatorLapangan>("/operator-lapangan/", payload);
  return data;
};

export const updateOperator = async (id: number, payload: OperatorLapanganUpdate) => {
  const { data } = await apiClient.put<OperatorLapangan>(`/operator-lapangan/${id}`, payload);
  return data;
};
