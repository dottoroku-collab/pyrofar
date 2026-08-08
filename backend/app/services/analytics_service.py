from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.armada import Armada, StatusArmada
from app.models.jenis_kendaraan import JenisKendaraan
from app.models.lokasi import Lokasi
from app.models.pemeliharaan import Pemeliharaan


def get_summary(db: Session) -> dict:
    total = db.query(func.count(Armada.id)).filter(Armada.is_deleted.is_(False)).scalar() or 0

    def count_status(*statuses):
        return (
            db.query(func.count(Armada.id))
            .filter(Armada.is_deleted.is_(False), Armada.status_armada.in_(statuses))
            .scalar()
            or 0
        )

    standby = count_status(StatusArmada.standby)
    sedang_bertugas = count_status(StatusArmada.sedang_bertugas)
    rusak = count_status(StatusArmada.rusak_ringan, StatusArmada.rusak_berat)
    pemeliharaan = count_status(StatusArmada.pemeliharaan, StatusArmada.menunggu_sparepart)
    menunggu_approval = count_status(StatusArmada.menunggu_approval)
    tidak_aktif = count_status(StatusArmada.tidak_aktif)

    availability_pct = round((standby + sedang_bertugas) / total * 100, 1) if total else 0.0

    start_of_month = date.today().replace(day=1)
    biaya_bulan_ini = (
        db.query(func.coalesce(func.sum(Pemeliharaan.biaya), 0))
        .filter(Pemeliharaan.is_deleted.is_(False), Pemeliharaan.tanggal >= start_of_month)
        .scalar()
        or 0
    )

    return {
        "total_armada": total,
        "standby": standby,
        "sedang_bertugas": sedang_bertugas,
        "rusak": rusak,
        "pemeliharaan": pemeliharaan,
        "menunggu_approval": menunggu_approval,
        "tidak_aktif": tidak_aktif,
        "availability_pct": availability_pct,
        "biaya_maintenance_bulan_ini": float(biaya_bulan_ini),
    }


def get_per_posko(db: Session) -> list[dict]:
    rows = (
        db.query(Lokasi.id, Lokasi.nama, func.count(Armada.id))
        .outerjoin(Armada, (Armada.lokasi_saat_ini_id == Lokasi.id) & (Armada.is_deleted.is_(False)))
        .filter(Lokasi.is_deleted.is_(False))
        .group_by(Lokasi.id, Lokasi.nama)
        .all()
    )
    return [{"lokasi_id": r[0], "lokasi_nama": r[1], "jumlah": r[2]} for r in rows]


def get_per_jenis(db: Session) -> list[dict]:
    rows = (
        db.query(JenisKendaraan.id, JenisKendaraan.nama, func.count(Armada.id))
        .outerjoin(Armada, (Armada.jenis_kendaraan_id == JenisKendaraan.id) & (Armada.is_deleted.is_(False)))
        .filter(JenisKendaraan.is_deleted.is_(False))
        .group_by(JenisKendaraan.id, JenisKendaraan.nama)
        .all()
    )
    return [{"jenis_id": r[0], "jenis_nama": r[1], "jumlah": r[2]} for r in rows]


def get_tren_maintenance(db: Session, bulan: int = 12) -> list[dict]:
    rows = (
        db.query(
            func.to_char(Pemeliharaan.tanggal, "YYYY-MM").label("bulan"),
            func.count(Pemeliharaan.id),
            func.coalesce(func.sum(Pemeliharaan.biaya), 0),
        )
        .filter(Pemeliharaan.is_deleted.is_(False))
        .group_by("bulan")
        .order_by("bulan")
        .all()
    )
    result = [{"bulan": r[0], "jumlah_pemeliharaan": r[1], "total_biaya": float(r[2])} for r in rows]
    return result[-bulan:]


def _agregasi_pemeliharaan_per_armada(db: Session, limit: int, ascending: bool):
    order = func.count(Pemeliharaan.id).asc() if ascending else func.count(Pemeliharaan.id).desc()
    return (
        db.query(
            Armada.id,
            Armada.kode_armada,
            func.count(Pemeliharaan.id),
            func.coalesce(func.sum(Pemeliharaan.biaya), 0),
        )
        .join(Pemeliharaan, Pemeliharaan.armada_id == Armada.id)
        .filter(Armada.is_deleted.is_(False), Pemeliharaan.is_deleted.is_(False))
        .group_by(Armada.id, Armada.kode_armada)
        .order_by(order)
        .limit(limit)
        .all()
    )


def get_ranking(db: Session, tipe: str = "terburuk", limit: int = 10) -> list[dict]:
    rows = _agregasi_pemeliharaan_per_armada(db, limit, ascending=(tipe == "terbaik"))
    return [
        {"armada_id": r[0], "kode_armada": r[1], "jumlah_pemeliharaan": r[2], "total_biaya": float(r[3])}
        for r in rows
    ]


def get_cost_per_vehicle(db: Session, limit: int = 20) -> list[dict]:
    rows = (
        db.query(
            Armada.id,
            Armada.kode_armada,
            func.count(Pemeliharaan.id),
            func.coalesce(func.sum(Pemeliharaan.biaya), 0),
        )
        .join(Pemeliharaan, Pemeliharaan.armada_id == Armada.id)
        .filter(Armada.is_deleted.is_(False), Pemeliharaan.is_deleted.is_(False))
        .group_by(Armada.id, Armada.kode_armada)
        .order_by(func.sum(Pemeliharaan.biaya).desc())
        .limit(limit)
        .all()
    )
    return [
        {"armada_id": r[0], "kode_armada": r[1], "jumlah_pemeliharaan": r[2], "total_biaya": float(r[3])}
        for r in rows
    ]


def get_mtbf_mttr(db: Session) -> list[dict]:
    """Pendekatan sederhana berbasis granularitas harian (bukan jam):
    MTBF = rata-rata hari antar entri pemeliharaan berurutan.
    MTTR presisi jam membutuhkan timestamp mulai/selesai pekerjaan — dicatat
    sebagai catatan untuk Sprint hardening bila diperlukan presisi lebih tinggi.
    """
    armadas = db.query(Armada).filter(Armada.is_deleted.is_(False)).all()
    result = []
    for a in armadas:
        entries = (
            db.query(Pemeliharaan)
            .filter(Pemeliharaan.armada_id == a.id, Pemeliharaan.is_deleted.is_(False))
            .order_by(Pemeliharaan.tanggal)
            .all()
        )
        mtbf = None
        if len(entries) > 1:
            span_days = (entries[-1].tanggal - entries[0].tanggal).days
            mtbf = round(span_days / (len(entries) - 1), 1)

        result.append(
            {"armada_id": a.id, "kode_armada": a.kode_armada, "mtbf_hari": mtbf, "mttr_jam": None}
        )
    return result
