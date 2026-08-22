import asyncio
import random
import uuid
from app.core.database import SessionLocal
from app.models.relawan import Relawan, StatusRelawan
from app.models.tenant import Tenant
from datetime import datetime

kecamatan_makassar = [
    "Biringkanaya", "Bontoala", "Makassar", "Mamajang", "Manggala", 
    "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", 
    "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo", "Kepulauan Sangkarrang"
]

first_names = ["Andi", "Muhammad", "Nur", "Siti", "Ahmad", "Ayu", "Budi", "Citra", "Dian", "Eko", "Fitri", "Gita", "Hendra", "Indra", "Joko"]
last_names = ["Saputra", "Pratama", "Hidayat", "Wijaya", "Kurniawan", "Sari", "Lestari", "Ningsih", "Wahab", "Syamsuddin", "Yusuf", "Rahman"]
pekerjaan_list = ["Wiraswasta", "PNS", "Karyawan Swasta", "Mahasiswa", "Pegawai BUMN", "TNI/Polri", "Buruh", "Petani", "Nelayan"]
pendidikan_list = ["SMA/SMK", "D3", "S1", "S2"]
golongan_darah_list = ["A", "B", "AB", "O", None]

async def seed_relawan():
    db = SessionLocal()
    try:
        # Get default tenant
        tenant = db.query(Tenant).first()
        if not tenant:
            print("No tenant found. Cannot seed.")
            return

        print(f"Using tenant ID: {tenant.id}")

        existing_count = db.query(Relawan).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} relawan. Seeding additional 50...")
            # optionally we can delete them if we want a fresh start, but user just said "tambahkan 50"

        for i in range(50):
            nama = f"{random.choice(first_names)} {random.choice(last_names)}"
            nik = f"7371{''.join([str(random.randint(0,9)) for _ in range(12)])}"
            no_telp = f"08{''.join([str(random.randint(0,9)) for _ in range(10)])}"
            
            kecamatan = random.choice(kecamatan_makassar)
            
            relawan = Relawan(
                tenant_id=tenant.id,
                nama=nama,
                nik=nik,
                no_telepon=no_telp,
                alamat=f"Jl. {random.choice(['Sudirman', 'Ratangi', 'Perintis', 'Urip', 'Bawakaraeng', 'Cendrawasih'])} No. {random.randint(1,100)}",
                provinsi="SULAWESI SELATAN",
                kota="KOTA MAKASSAR",
                kecamatan=kecamatan.upper(),
                kelurahan=None,  # skip kelurahan for simplicity
                pekerjaan=random.choice(pekerjaan_list),
                pendidikan=random.choice(pendidikan_list),
                golongan_darah=random.choice(golongan_darah_list),
                status=random.choices([StatusRelawan.active, StatusRelawan.in_mission, StatusRelawan.inactive], weights=[0.8, 0.15, 0.05])[0],
                latitude=str(-5.147665 + random.uniform(-0.05, 0.05)),
                longitude=str(119.432731 + random.uniform(-0.05, 0.05)),
            )
            db.add(relawan)
        
        db.commit()
        print("Successfully seeded 50 Relawan Damkar data in Makassar.")

    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_relawan())
