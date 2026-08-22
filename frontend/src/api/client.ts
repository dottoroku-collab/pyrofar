import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const BACKEND_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function getAssetUrl(path: string | null | undefined) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${BACKEND_URL}${path}`;
}

export const apiClient = axios.create({
  baseURL: "/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes("/auth/login")) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      const messageDetail = error.response?.data?.detail;
      if (messageDetail && (messageDetail.toLowerCase().includes("lisensi") || messageDetail.toLowerCase().includes("fitur"))) {
        import("antd").then(({ message }) => {
          message.error(messageDetail);
        });
      }
    }

    return Promise.reject(error);
  }
);
