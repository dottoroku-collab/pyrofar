import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const backendTarget = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: backendTarget, changeOrigin: true },
      "/uploads": { target: backendTarget, changeOrigin: true },
    },
  },
});
