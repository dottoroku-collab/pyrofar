# Deployment Pyrofar di VPS (dengan Nginx Proxy Manager & GitHub Actions)

Panduan ini berisi langkah-langkah untuk mendeploy Pyrofar di VPS Anda (`103.151.20.74`) secara otomatis menggunakan **GitHub Actions**. VPS Anda sudah diasumsikan memiliki PostgreSQL dan Nginx Proxy Manager (NPM).

## 1. Setup GitHub Secrets untuk Auto Deploy

Masuk ke Repository GitHub `dottoroku-collab/pyrofar`, buka **Settings** -> **Secrets and variables** -> **Actions**, lalu tambahkan *Repository secrets* berikut:

- `HOST`: `103.151.20.74`
- `USERNAME`: Username SSH VPS Anda (contoh: `root` atau `ubuntu`)
- `SSH_KEY`: Private Key SSH VPS Anda (isinya yang berawal dengan `-----BEGIN PRIVATE KEY-----`). Anda perlu *generate* SSH key ini di server atau komputer Anda, taruh public key ke `~/.ssh/authorized_keys` di VPS, dan masukkan private key ke secret ini.

## 2. Persiapan VPS (Satu Kali Saja)

Buat direktori `/opt/pyrofar` (atau direktori manapun yang di-setup di script GitHub Actions) dan buat file `.env`:

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

## 3. Alur Update Otomatis (Deploy)
Setiap kali Anda melakukan `git push` ke branch `main`, GitHub Actions akan otomatis login ke VPS, menarik kode terbaru, dan me-restart container melalui `docker-compose.prod.yml`.

Docker compose ini akan menjalankan:
1. `backend` (FastAPI) berjalan di port `8000`
2. `frontend` (Vite/Nginx React) berjalan di port `3080`
3. `livekit` (WebRTC) berjalan di port `7880` (TCP) dan `7881-7882` (UDP)
4. `redis` & `minio` & `worker` (Background jobs)

## 4. Setel Nginx Proxy Manager (NPM)

Masuk ke panel NPM Anda dan buat 3 buah **Proxy Host**:

### A. Backend API (`api.pyrofar.com`)
- **Domain Names**: `api.pyrofar.com`
- **Forward Hostname / IP**: `172.17.0.1` (atau IP lokal VPS)
- **Forward Port**: `8000`
- **Websockets Support**: ✅ Centang
- **SSL**: Request SSL sertifikat baru (Let's Encrypt) -> Enable `Force SSL`

### B. LiveKit PTT (`livekit.pyrofar.com`)
- **Domain Names**: `livekit.pyrofar.com`
- **Forward Hostname / IP**: `172.17.0.1`
- **Forward Port**: `7880`
- **Websockets Support**: ✅ Centang (Sangat Wajib)
- **SSL**: Request SSL sertifikat baru -> Enable `Force SSL`

### C. Web Dashboard (`app.pyrofar.com`)
- **Domain Names**: `app.pyrofar.com`
- **Forward Hostname / IP**: `172.17.0.1`
- **Forward Port**: `3080`
- **SSL**: Request SSL sertifikat baru -> Enable `Force SSL`
