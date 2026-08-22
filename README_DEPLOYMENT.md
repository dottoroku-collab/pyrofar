# Deployment Pyrofar di VPS dengan Nginx Proxy Manager (NPM)

Panduan ini berisi langkah-langkah untuk mendeploy Pyrofar di VPS yang sudah memiliki Nginx Proxy Manager dan PostgreSQL yang berjalan secara terpisah.

## 1. Persiapan Environment

Buat file `.env` di folder root project (`pyrofar/`) dan sesuaikan nilainya:

```env
# URL Database PostgreSQL eksternal yang ada di VPS Anda
DATABASE_URL=postgresql://user:password@172.17.0.1:5432/sim_armada

# MinIO Storage
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=supersecret123

# JWT & Keamanan
JWT_SECRET_KEY=ubah_ini_menjadi_secret_yang_sangat_panjang_dan_aman
CORS_ORIGINS=["*"]
```
*Catatan: `172.17.0.1` adalah default IP untuk docker bridge. Jika PostgreSQL Anda berjalan di network Docker yang sama, Anda bisa langsung tembak IP tersebut, atau gunakan IP publik VPS jika diizinkan.*

## 2. Menjalankan Docker Compose

Pastikan Anda berada di root folder `pyrofar` lalu jalankan:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Docker compose ini akan menjalankan:
1. `backend` (FastAPI) berjalan di port `8000`
2. `frontend` (Vite/Nginx React) berjalan di port `3080`
3. `livekit` (WebRTC) berjalan di port `7880` (TCP) dan `7881-7882` (UDP)
4. `redis` & `minio` & `worker` (Background jobs)

## 3. Setel Nginx Proxy Manager (NPM)

Masuk ke panel NPM Anda dan buat 3 buah **Proxy Host**:

### A. Backend API (`api.pyrofar.com`)
- **Domain Names**: `api.pyrofar.com`
- **Forward Hostname / IP**: IP lokal VPS atau `172.17.0.1` (atau IP docker container)
- **Forward Port**: `8000`
- **Websockets Support**: ✅ Centang (Wajib untuk tracking / realtime dashboard)
- **SSL**: Request SSL sertifikat baru (Let's Encrypt) -> Enable `Force SSL`

### B. LiveKit PTT (`livekit.pyrofar.com`)
- **Domain Names**: `livekit.pyrofar.com`
- **Forward Hostname / IP**: IP lokal VPS atau `172.17.0.1`
- **Forward Port**: `7880`
- **Websockets Support**: ✅ Centang (Sangat Wajib untuk WebRTC)
- **SSL**: Request SSL sertifikat baru -> Enable `Force SSL`

### C. Web Dashboard (`app.pyrofar.com`)
- **Domain Names**: `app.pyrofar.com` (atau `dashboard.pyrofar.com`)
- **Forward Hostname / IP**: IP lokal VPS atau `172.17.0.1`
- **Forward Port**: `3080`
- **SSL**: Request SSL sertifikat baru -> Enable `Force SSL`

---
✅ **Selesai!** Sekarang Pyrofar dapat diakses melalui domain publik yang diamankan dengan SSL HTTPS.
