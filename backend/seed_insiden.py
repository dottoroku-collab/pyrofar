import sys
import random
from datetime import datetime, timedelta
import uuid

# Adjust path to import app modules
sys.path.append('.')
from app.core.database import SessionLocal
from app.models.tenant import Tenant
from app.models.insiden import Insiden, JenisInsiden, StatusInsiden

def get_random_date_in_month(year, month):
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)
    
    delta = end - start
    random_days = random.randrange(delta.days)
    random_seconds = random.randrange(24*60*60)
    return start + timedelta(days=random_days, seconds=random_seconds)

def seed_data():
    db = SessionLocal()
    tenant = db.query(Tenant).first()
    
    if not tenant:
        print("No tenant found. Cannot seed data.")
        return
        
    monthly_data = [
      {"month": 1, "total": 17, "penyebab": ["listrik"]*3 + ["tabung gas/kompor"]*3 + ["lain-lain/tidak diketahui"]*11, "objek": ["rumah tinggal"]*16 + ["toko/kios/cafe"]*4 + ["kendaraan"]*15 + ["sampah/alang-alang/dll"]*5, "luka": 1, "kk": 45, "luas": 1035, "rugi": 926000000},
      {"month": 2, "total": 12, "penyebab": ["listrik"]*1 + ["tabung gas/kompor"]*3 + ["sampah/alang-alang/dll"]*1 + ["lain-lain/tidak diketahui"]*7, "objek": ["rumah tinggal"]*18 + ["toko/kios/cafe"]*2 + ["hotel/asrama"]*1 + ["sampah/alang-alang/dll"]*2, "kk": 55, "luas": 1836, "rugi": 982300000},
      {"month": 3, "total": 10, "penyebab": ["listrik"]*1 + ["tabung gas/kompor"]*4 + ["sampah/alang-alang/dll"]*2 + ["lain-lain/tidak diketahui"]*3, "objek": ["rumah tinggal"]*11 + ["kantor/sekolah"]*1 + ["kendaraan"]*1 + ["sampah/alang-alang/dll"]*3, "kk": 25, "luas": 753, "rugi": 513000000},
      {"month": 4, "total": 18, "penyebab": ["listrik"]*2 + ["sampah/alang-alang/dll"]*2 + ["lain-lain/tidak diketahui"]*14, "objek": ["rumah tinggal"]*7 + ["gudang"]*3 + ["kendaraan"]*1 + ["sampah/alang-alang/dll"]*8, "meninggal": 1, "kk": 14, "luas": 1087, "rugi": 935000000},
      {"month": 5, "total": 15, "penyebab": ["listrik"]*6 + ["tabung gas/kompor"]*1 + ["sampah/alang-alang/dll"]*1 + ["lain-lain/tidak diketahui"]*7, "objek": ["rumah tinggal"]*7 + ["toko/kios/cafe"]*2 + ["industri/perusahaan"]*2 + ["kantor/sekolah"]*2 + ["sampah/alang-alang/dll"]*4, "luka": 5, "kk": 16, "luas": 1150, "rugi": 846000000},
      {"month": 6, "total": 31, "penyebab": ["listrik"]*6 + ["tabung gas/kompor"]*2 + ["sampah/alang-alang/dll"]*3 + ["lain-lain/tidak diketahui"]*20, "objek": ["rumah tinggal"]*20 + ["toko/kios/cafe"]*3 + ["gudang"]*4 + ["kantor/sekolah"]*1 + ["kendaraan"]*8 + ["sampah/alang-alang/dll"]*12, "kk": 60, "luas": 1842, "rugi": 1672000000},
      {"month": 7, "total": 47, "penyebab": ["listrik"]*6 + ["tabung gas/kompor"]*1 + ["sampah/alang-alang/dll"]*31 + ["lain-lain/tidak diketahui"]*9, "objek": ["rumah tinggal"]*68 + ["toko/kios/cafe"]*1 + ["kantor/sekolah"]*2 + ["kendaraan"]*2 + ["sampah/alang-alang/dll"]*44, "meninggal": 2, "kk": 126, "luas": 2350, "rugi": 2012000000},
      {"month": 8, "total": 34, "penyebab": ["listrik"]*3 + ["sampah/alang-alang/dll"]*22 + ["lain-lain/tidak diketahui"]*9, "objek": ["rumah tinggal"]*48 + ["toko/kios/cafe"]*7 + ["industri/perusahaan"]*1 + ["sampah/alang-alang/dll"]*28, "kk": 104, "luas": 2875, "rugi": 2820000000},
    ]

    incidents_to_insert = []
    
    alamat_samples = [
        "Jl. Urip Sumoharjo No. 12", "Jl. AP Pettarani", "Kawasan KIMA", 
        "Jl. Perintis Kemerdekaan KM 10", "BTP Blok M", "Jl. Sungai Saddang Baru",
        "Panakkukang Mas", "Jl. Sultan Hasanuddin", "Jl. Veteran Selatan", "Losari"
    ]

    for data in monthly_data:
        total = data["total"]
        
        penyebab_pool = data.get("penyebab", [])
        objek_pool = data.get("objek", [])
        
        random.shuffle(penyebab_pool)
        random.shuffle(objek_pool)
        
        # distribute numeric data somewhat evenly
        luka_left = data.get("luka", 0)
        meninggal_left = data.get("meninggal", 0)
        kk_left = data.get("kk", 0)
        luas_left = data.get("luas", 0)
        rugi_left = data.get("rugi", 0)
        
        for i in range(total):
            lapor_time = get_random_date_in_month(2026, data["month"])
            
            # assign 1 item from pools if available, else default
            kategori = penyebab_pool.pop() if penyebab_pool else "lain-lain/tidak diketahui"
            objek = objek_pool.pop() if objek_pool else "rumah tinggal"
            
            # calculate portions for metrics
            is_last = (i == total - 1)
            
            cur_luka = luka_left if is_last else (1 if luka_left > 0 and random.random() > 0.7 else 0)
            luka_left -= cur_luka
            
            cur_meninggal = meninggal_left if is_last else (1 if meninggal_left > 0 and random.random() > 0.9 else 0)
            meninggal_left -= cur_meninggal
            
            cur_kk = kk_left if is_last else min(kk_left, random.randint(0, (kk_left // (total - i)) * 2 + 1))
            kk_left -= cur_kk
            
            cur_luas = luas_left if is_last else min(luas_left, random.randint(10, (luas_left // (total - i)) * 2 + 1))
            luas_left -= cur_luas
            
            cur_rugi = rugi_left if is_last else min(rugi_left, random.randint(1000000, (rugi_left // (total - i)) * 2 + 1000000))
            rugi_left -= cur_rugi

            inc = Insiden(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                jenis_insiden=JenisInsiden.pemadaman,
                kategori=kategori.upper(),
                objek=objek.upper(),
                alamat=random.choice(alamat_samples),
                pelapor_nama="Warga Makassar",
                pelapor_kontak="08123456789",
                waktu_lapor=lapor_time,
                waktu_berangkat=lapor_time + timedelta(minutes=random.randint(2, 5)),
                waktu_tiba=lapor_time + timedelta(minutes=random.randint(6, 15)),
                waktu_selesai=lapor_time + timedelta(minutes=random.randint(30, 180)),
                status=StatusInsiden.selesai,
                is_verified=True,
                korban_luka=cur_luka,
                korban_meninggal=cur_meninggal,
                korban_kk=cur_kk,
                luas_areal=cur_luas,
                taksiran_kerugian=cur_rugi,
                jumlah_terdampak=random.randint(1, 3) if cur_kk > 0 else 0
            )
            incidents_to_insert.append(inc)
            
    try:
        db.bulk_save_objects(incidents_to_insert)
        db.commit()
        print(f"Successfully seeded {len(incidents_to_insert)} incidents!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
