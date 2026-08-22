import { apiClient } from "./client";

export interface Kompi {
  id: number;
  nama: string;
  deskripsi?: string;
  created_at: string;
}

export interface Pleton {
  id: number;
  kompi_id: number;
  nama: string;
  deskripsi?: string;
  kompi?: Kompi;
  created_at: string;
}

export interface Regu {
  id: number;
  pleton_id: number;
  station_id?: number;
  nama: string;
  deskripsi?: string;
  pleton?: Pleton;
  created_at: string;
}

export interface Personil {
  id: number;
  regu_id?: number;
  nip_nik: string;
  nama_lengkap: string;
  jabatan: string;
  no_hp?: string;
  foto_url?: string;
  is_active: boolean;
  regu?: Regu;
  created_at: string;
}

// KOMPI API
export const getKompis = () => apiClient.get<Kompi[]>("/kompi").then((res: any) => res.data);
export const createKompi = (data: any) => apiClient.post<Kompi>("/kompi", data).then((res: any) => res.data);
export const updateKompi = (id: number, data: any) => apiClient.put<Kompi>(`/kompi/${id}`, data).then((res: any) => res.data);
export const deleteKompi = (id: number) => apiClient.delete(`/kompi/${id}`).then((res: any) => res.data);

// PLETON API
export const getPletons = () => apiClient.get<Pleton[]>("/pleton").then((res: any) => res.data);
export const createPleton = (data: any) => apiClient.post<Pleton>("/pleton", data).then((res: any) => res.data);
export const updatePleton = (id: number, data: any) => apiClient.put<Pleton>(`/pleton/${id}`, data).then((res: any) => res.data);
export const deletePleton = (id: number) => apiClient.delete(`/pleton/${id}`).then((res: any) => res.data);

// REGU API
export const getRegus = () => apiClient.get<Regu[]>("/regu").then((res: any) => res.data);
export const createRegu = (data: any) => apiClient.post<Regu>("/regu", data).then((res: any) => res.data);
export const updateRegu = (id: number, data: any) => apiClient.put<Regu>(`/regu/${id}`, data).then((res: any) => res.data);
export const deleteRegu = (id: number) => apiClient.delete(`/regu/${id}`).then((res: any) => res.data);

// PERSONIL API
export const getPersonils = () => apiClient.get<Personil[]>("/personil").then((res: any) => res.data);
export const createPersonil = (data: any) => apiClient.post<Personil>("/personil", data).then((res: any) => res.data);
export const updatePersonil = (id: number, data: any) => apiClient.put<Personil>(`/personil/${id}`, data).then((res: any) => res.data);
export const deletePersonil = (id: number) => apiClient.delete(`/personil/${id}`).then((res: any) => res.data);
