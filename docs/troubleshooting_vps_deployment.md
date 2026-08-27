# Troubleshooting Deployment VPS & Database Connection

Dokumen ini mencatat insiden yang pernah terjadi terkait masalah login dan koneksi database di server VPS produksi (Host: `103.151.20.74`, user: `nocx`), beserta akar masalah dan solusinya, agar mudah ditangani jika terjadi masalah serupa di kemudian hari.

## 1. Deskripsi Insiden (Gagal Login 500 Internal Server Error)
**Gejala:** 
- Pengguna tidak bisa login di `app.pyrofar.com`.
- Terdapat error dari backend: `FATAL: password authentication failed for user "postgres"`.
- Setelah itu muncul pesan error lain seperti `UndefinedTable: relation "users" does not exist`.

## 2. Akar Masalah (Root Cause)
Masalah ini timbul akibat **ketidaksengajaan me-replace file konfigurasi `.env` di server VPS**. 

1. **Arsitektur VPS:** Sistem produksi menggunakan satu container global `postgres` (versi 17) dan `redis` yang terhubung ke jaringan `proxy-network` dan `backend-network`.
2. **Kesalahan Rsync:** Saat melakukan *deployment* atau *push* kode (menggunakan command `rsync`), file `.env` lokal (environment development) ikut terkirim dan **menimpa** file `.env` di VPS.
3. **Konflik Password:** File `.env` lokal menggunakan kredensial standar (`POSTGRES_PASSWORD=postgres`), sedangkan server produksi membutuhkan password khusus (`Bismillah26*`). 
4. Akibat file `.env` yang tertimpa ini, backend gagal melakukan autentikasi ke database produksi.
5. Saat dicoba dipisahkan ke container `postgres` yang baru (agar standalone), yang terjadi justru backend terkoneksi ke database kosong (tidak ada tabel `users`), sehingga memunculkan error `UndefinedTable`.

## 3. Solusi & Langkah Perbaikan
Jika terjadi masalah serupa, berikut adalah urutan pengecekan dan perbaikan yang perlu dilakukan:

### A. Verifikasi File `.env` Produksi
Pastikan file `.env` di VPS `~/pyrofar/` tidak menggunakan kredensial lokal. 
Cek konfigurasi password:
```env
# HARUS menggunakan password produksi
POSTGRES_PASSWORD=Bismillah26*
DATABASE_URL=postgresql+psycopg2://postgres:Bismillah26*@postgres:5432/sim_armada
REDIS_URL=redis://redis:6379/0
```

### B. Mencegah File `.env` Lokal Ter-upload
Pastikan command `rsync` selalu mengecualikan file `.env` (atau pastikan file `.env` masuk ke dalam file `.gitignore` atau script deploy).
Contoh command rsync yang aman:
```bash
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '__pycache__' --exclude 'venv' --exclude '.env' . nocx:~/pyrofar/
```

### C. Konfigurasi `docker-compose.prod.yml`
Pastikan service `backend` dan `worker` terhubung ke jaringan di mana container global `postgres` berada (dalam hal ini `proxy-network` dan `backend-network`). Jangan membuat instance container `postgres` dan `redis` baru di dalam `docker-compose.prod.yml` jika menggunakan instance global.

```yaml
services:
  backend:
    networks:
      - proxy-network
      - backend-network

networks:
  proxy-network:
    external: true
  backend-network:
    external: true
```

## 4. Perintah Berguna untuk Debugging di VPS
- **Mengecek konfigurasi password di container database saat ini:**
  ```bash
  docker inspect postgres | grep POSTGRES_PASSWORD
  ```
- **Mengecek ketersediaan tabel pada database:**
  ```bash
  docker exec -it postgres psql -U postgres -d sim_armada -c "\dt"
  ```
- **Mengecek log backend:**
  ```bash
  docker compose -f docker-compose.prod.yml logs --tail=50 backend
  ```
