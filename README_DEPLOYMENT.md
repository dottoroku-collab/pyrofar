# Deployment Pyrofar di Hostinger Cloud Server

Panduan ini berisi langkah-langkah untuk mendeploy Pyrofar di Hostinger Cloud / VPS secara otomatis menggunakan **GitHub Actions**.

## 1. Persiapan Server Hostinger (Satu Kali Saja)

1. Pastikan **Docker** dan **Docker Compose** sudah terinstall di server Hostinger Anda.
2. Buat direktori deployment, misalnya di `/opt/pyrofar`.
3. Buat file `/opt/pyrofar/.env` secara manual di server dengan isi (minimal):

```env
POSTGRES_PASSWORD=supersecret_db_pass
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=supersecret123
JWT_SECRET_KEY=ubah_ini_menjadi_secret_yang_sangat_panjang_dan_aman
CORS_ORIGINS=["*"]
```

## 2. Persiapan DNS (Hostinger Panel)

Arahkan A-Record di DNS Management Hostinger Anda ke IP Cloud Server Anda (`145.223.108.140`):
- `api` -> `145.223.108.140` (Untuk Backend API)
- `livekit` -> `145.223.108.140` (Untuk Audio PTT WebRTC)
- `app` -> `145.223.108.140` (Untuk Web Dashboard)

> Note: Cloudflare proxy boleh dimatikan (DNS Only) agar port WebRTC dan Caddy auto-SSL berjalan lancar.

## 3. Setup GitHub Secrets untuk Auto Deploy

Masuk ke Repository GitHub `dottoroku-collab/pyrofar`, buka **Settings** -> **Secrets and variables** -> **Actions**, lalu tambahkan *Repository secrets* berikut:

- `HOST`: `145.223.108.140`
- `USERNAME`: Username SSH server Anda (contoh: `root` atau `ubuntu`)
- `SSH_KEY`: Private Key SSH (isinya yang berawal dengan `-----BEGIN PRIVATE KEY-----`). Anda perlu *generate* SSH key ini di server atau komputer Anda, taruh public key ke `~/.ssh/authorized_keys` di Hostinger, dan masukkan private key ke secret ini.

## 4. Alur Update (Deploy)
Setiap kali Anda melakukan `git push` ke branch `main`, GitHub Actions akan otomatis login ke Hostinger Anda, mendownload kode terbaru, dan melakukan restart/build pada container Docker melalui `docker-compose.prod.yml`.

Anda tidak perlu login manual ke server lagi!
