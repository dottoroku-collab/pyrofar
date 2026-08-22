import asyncio
import uuid
import random
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import SessionLocal
from app.models.relawan import Relawan, StatusRelawan
from app.seed import MAKASSAR_TENANT_ID

fake = Faker('id_ID')

KECAMATAN_MAKASSAR = [
    "Biringkanaya", "Bontoala", "Makassar", "Mamajang", "Manggala",
    "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea",
    "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo", "Kepulauan Sangkarrang"
]

GOLONGAN_DARAH = ["A", "B", "AB", "O"]
KOMUNITAS_LIST = [
    "Relawan Damkar Nusantara",
    "Siaga Bencana Makassar",
    "Komunitas Rescue 911",
    "Relawan Mandiri",
    "Pemuda Siaga",
    "Red Cross Volunteer"
]

# Approximate center of each kecamatan
KECAMATAN_COORDS = {
    "Biringkanaya": (-5.0883, 119.5135),
    "Bontoala": (-5.1328, 119.4216),
    "Makassar": (-5.1415, 119.4206),
    "Mamajang": (-5.1583, 119.4182),
    "Manggala": (-5.1580, 119.4851),
    "Mariso": (-5.1610, 119.4082),
    "Panakkukang": (-5.1448, 119.4455),
    "Rappocini": (-5.1655, 119.4443),
    "Tallo": (-5.1227, 119.4276),
    "Tamalanrea": (-5.1303, 119.4975),
    "Tamalate": (-5.1873, 119.4089),
    "Ujung Pandang": (-5.1388, 119.4121),
    "Ujung Tanah": (-5.1118, 119.4162),
    "Wajo": (-5.1311, 119.4107),
    "Kepulauan Sangkarrang": (-5.1055, 119.3875)
}

def generate_random_coordinate(base_lat, base_lng):
    # Add random offset (approx within a few km)
    offset_lat = random.uniform(-0.015, 0.015)
    offset_lng = random.uniform(-0.015, 0.015)
    return str(base_lat + offset_lat), str(base_lng + offset_lng)

def seed_relawan():
    db = SessionLocal()
    try:
        print("Mulai membuat 50 data dummy Relawan...")
        
        relawan_list = []
        for i in range(50):
            kecamatan = random.choice(KECAMATAN_MAKASSAR)
            base_lat, base_lng = KECAMATAN_COORDS[kecamatan]
            lat, lng = generate_random_coordinate(base_lat, base_lng)
            
            new_relawan = Relawan(
                id=uuid.uuid4(),
                tenant_id=MAKASSAR_TENANT_ID,
                nama=fake.name(),
                nik=str(random.randint(1000000000000000, 9999999999999999)),
                no_telepon=fake.phone_number(),
                alamat=fake.street_address(),
                provinsi="Sulawesi Selatan",
                kota="Kota Makassar",
                kecamatan=kecamatan,
                kelurahan=fake.word(),
                pekerjaan=fake.job(),
                pendidikan=random.choice(["SMA", "D3", "S1", "S2"]),
                golongan_darah=random.choice(GOLONGAN_DARAH),
                komunitas=random.choice(KOMUNITAS_LIST),
                latitude=lat,
                longitude=lng,
                status=random.choice(list(StatusRelawan)),
                skills=[fake.word() for _ in range(3)],
            )
            relawan_list.append(new_relawan)
        
        db.add_all(relawan_list)
        db.commit()
        print(f"Berhasil menambahkan 50 data relawan ke database.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_relawan()
