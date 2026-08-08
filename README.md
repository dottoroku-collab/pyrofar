# SIM Armada Damkar Makassar — Sprint 1

Setup proyek + Autentikasi (JWT) sesuai Tahap 12 (Sprint Planning), Sprint 1.

## Menjalankan (lokal, dengan Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Backend: http://localhost:8000/docs (Swagger otomatis dari FastAPI)
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432 (user/pass: postgres/postgres)

## Setelah container backend berjalan, jalankan migrasi & seed

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

Akun awal yang dibuat oleh seed:
- **Email:** admin@damkar.makassar.go.id
- **Password:** ChangeMe123! (segera ganti setelah login pertama)

## Menjalankan tanpa Docker (opsional)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Status Sprint 1 — Fondasi & Autentikasi

- [x] Struktur proyek (backend FastAPI + frontend React/TS/Vite), Docker Compose
- [x] Migrasi awal: `users`, `jenis_kendaraan`, `lokasi`
- [x] Autentikasi JWT: `/auth/login`, `/auth/refresh`, `/auth/me`
- [x] Role guard (`require_role`) siap dipakai endpoint Sprint 2 dst.
- [x] Frontend: Login page, route guard, shell layout (Sidebar gelap + Topbar) bertema Tahap 9

## Status Sprint 2 — Master Data & Data Armada

- [x] Migrasi `armada`, `armada_file` (+ 3 enum: status_armada, approval_status, jenis_file_armada)
- [x] CRUD `jenis-kendaraan`, `lokasi` (soft-delete, Admin only)
- [x] CRUD `armada` lengkap + upload dokumen/foto (`armada_file`) + generate `qr_code_value`
- [x] Aturan hapus: Admin = semua, Operator = data miliknya sendiri (FR-26)
- [x] Frontend: halaman Master Data (Tabs), List Armada (filter/search), Form Tambah/Edit
      Armada (Tabs Identitas/Dokumen/Foto), Detail Armada (QR Code + Descriptions)
- [ ] Sprint 3 dst.: lihat `12-sprint-planning.md` (Lokasi/Status/Approval, dst.)

## Status Sprint 3 — Lokasi, Status Armada & Approval

- [x] Migrasi `histori_lokasi`, `histori_status`, `notifikasi`
- [x] `POST /armada/{id}/pindah-lokasi` + `GET /armada/{id}/histori-lokasi`
- [x] `PUT /armada/{id}/status` — otomatis deteksi status kritis (Rusak Berat/Tidak Aktif)
      dan set `menunggu_approval` sesuai BR-03
- [x] `GET /approval`, `POST /approval/{id}/approve`, `POST /approval/{id}/reject` (khusus Kabid)
- [x] Notifikasi in-app otomatis: ke semua Kabid saat ada pengajuan, ke pengaju saat
      disetujui/ditolak
- [x] Frontend: Modal "Pindah Lokasi" & "Ubah Status" di Detail Armada (dengan peringatan
      jika status kritis), halaman Approval (Kabid) dengan modal alasan penolakan,
      bell notifikasi di Topbar terhubung ke data nyata (polling 30 detik)

## Status Sprint 4 — Pemeliharaan, Sparepart & Reminder

- [x] Migrasi `pemeliharaan`, `sparepart`, `jadwal_servis`
- [x] CRUD `pemeliharaan` + nested `sparepart` (bisa lebih dari satu sparepart per entri)
- [x] `GET /armada/{id}/timeline` — gabungan histori lokasi, status, dan pemeliharaan, terurut
      kronologis terbaru dulu
- [x] Upload foto sebelum/sesudah pemeliharaan
- [x] `jadwal_servis` otomatis tersinkron dari `tanggal_stnk` armada; cron harian
      (`APScheduler`, jalan 06:00) cek jatuh tempo dan kirim notifikasi ke Admin/Operator/Teknisi
- [x] Aturan hapus: Admin = semua, Teknisi = data yang ia input sendiri (FR-26)
- [x] Frontend: Form Input Pemeliharaan dengan tabel sparepart inline, Timeline nyata
      (bukan dummy) di Detail Armada, badge peringatan STNK mendekati/lewat jatuh tempo
      di List Armada

## Status Sprint 5 — Dashboard & Analytics

- [x] `GET /dashboard/summary` — total armada, standby, rusak, pemeliharaan, availability %,
      biaya maintenance bulan ini (semua dihitung langsung dari database, bukan dummy)
- [x] `GET /dashboard/per-posko`, `/dashboard/per-jenis` — distribusi armada
- [x] `GET /dashboard/tren-maintenance` — agregasi biaya & jumlah pemeliharaan per bulan
- [x] `GET /analytics/mtbf-mttr`, `/analytics/cost-per-vehicle`, `/analytics/ranking`
      (catatan: MTTR presisi jam butuh timestamp mulai/selesai pekerjaan — saat ini
      granularitas harian, cukup untuk MTBF; lihat komentar di `analytics_service.py`)
- [x] Frontend: Dashboard terhubung 100% ke data nyata — Statistic Card, donut chart
      availability, bar chart per posko, line chart tren biaya, tabel ranking armada
      bermasalah (pakai **recharts**, bukan lagi mockup statis Tahap 9)

## Status Sprint 6 — Laporan, Pencarian, Audit Log, QR Publik & Pengguna

- [x] Migrasi `audit_log` (append-only, tanpa kolom edit/delete — sesuai BR-08)
- [x] Audit log otomatis tercatat di: login, tambah/edit/hapus armada, pindah lokasi,
      ubah status, approve/reject, input pemeliharaan, hapus pemeliharaan, CRUD pengguna
- [x] `GET /audit-log` (Admin, filter user/entitas/tanggal)
- [x] `GET /laporan/export?format=excel|pdf` — export dengan filter jenis/lokasi/status
      (pakai `openpyxl` & `reportlab`)
- [x] Pencarian `/armada?q=...` diperluas mencakup merk (selain kode/no. polisi/no. lambung)
- [x] `GET /public/armada/{qr_code_value}` — **tanpa login**, hanya data umum + servis
      terakhir (FR-06), detail dokumen/biaya tidak pernah diekspos di endpoint ini
- [x] CRUD `/users` (Admin) dengan hash password saat pembuatan akun
- [x] Frontend: halaman Laporan (filter + download Excel/PDF), Audit Log, Manajemen
      Pengguna, dan **halaman publik QR** (`/public/armada/:qrCodeValue`) — di luar layout
      aplikasi & tanpa perlu login, dengan tombol "Login untuk Detail Lengkap"

**Seluruh modul FR-01 s.d. FR-26 (Tahap 1) sekarang punya endpoint & UI yang berfungsi.**
Sprint 7 (terakhir): testing, hardening keamanan, dan persiapan deployment.

## Status Sprint 7 — Testing, Hardening & Deployment

### Testing
- [x] Unit test (tanpa DB): aturan hapus FR-26 (`tests/test_armada_service.py`)
- [x] Integration test: alur approval status kritis BR-03 — status kritis masuk
      `menunggu_approval`, approve/reject Kabid, status non-kritis langsung berlaku
      (`tests/test_approval_flow.py`) — ini pengujian paling penting di seluruh sistem
- [x] Integration test: login sukses/gagal (`tests/test_auth.py`)

### Hardening Keamanan
- [x] Validasi upload file: batasi ekstensi (`.jpg .jpeg .png .webp .pdf`) & ukuran maks 5MB
- [x] Rate limiting login: 5 percobaan/menit per IP (`slowapi`), cegah brute-force password
- [x] Peringatan otomatis di log saat startup jika `JWT_SECRET_KEY` masih nilai default
- [x] RBAC sudah konsisten di seluruh endpoint sejak Sprint 1–6 (`require_role`)
- [x] Audit log immutable (BR-08) sejak Sprint 6

### Deployment
- [x] `Dockerfile.prod` backend (tanpa `--reload`, 4 worker)
- [x] `Dockerfile.prod` + `nginx.conf` frontend (multi-stage build, static file serving,
      proxy `/api/` ke backend)
- [x] `docker-compose.prod.yml` — backend tidak expose port ke host (hanya lewat nginx),
      volume terpisah untuk `uploads` agar persisten

## Menjalankan Test

Test membutuhkan **PostgreSQL nyata** (bukan SQLite) karena skema memakai ENUM, JSONB,
dan partial unique index milik PostgreSQL:

```bash
# Siapkan database test (bisa pakai container postgres yang sama, cukup buat DB baru)
docker compose exec postgres psql -U postgres -c "CREATE DATABASE sim_armada_test;"

# Install dependency testing
cd backend
pip install -r requirements-dev.txt --break-system-packages

# Jalankan
TEST_DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/sim_armada_test pytest
```

## Deployment Produksi

```bash
cp .env.example .env   # isi JWT_SECRET_KEY & POSTGRES_PASSWORD dengan nilai yang kuat & unik
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml exec backend python -m app.seed
```

Aplikasi tersedia di port 80 (nginx men-serve frontend + proxy `/api/` ke backend).

**Belum termasuk dalam scaffold ini (perlu disiapkan di level infrastruktur oleh tim Anda):**
- Terminasi HTTPS/TLS (reverse proxy tambahan seperti Traefik/Certbot, atau load balancer cloud)
- Backup otomatis database PostgreSQL
- Object storage (S3/MinIO) untuk pengganti upload file lokal saat skala produksi besar
- Monitoring/alerting (mis. Sentry, Prometheus)

## Catatan implementasi

- **Upload file** memakai disk lokal (`backend/uploads/`) untuk kesederhanaan Sprint 2.
  Ganti ke object storage (S3/MinIO) sebelum produksi — dicatat sebagai task Sprint 7 (Hardening).
- **QR Code**: backend hanya membuat `qr_code_value` (string unik); gambar QR-nya
  di-render di frontend pakai komponen `<QRCode>` dari Ant Design — tidak ada file gambar
  yang disimpan di server (sesuai catatan desain Tahap 5).

## Catatan

File ini dibuat di lingkungan tanpa akses internet, sehingga dependency
(`pip install`, `npm install`) **belum pernah dijalankan/divalidasi** di sini.
Jalankan seperti langkah di atas di komputer/server Anda untuk instalasi &
verifikasi pertama kali.
