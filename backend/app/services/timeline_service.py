from sqlalchemy.orm import Session

from app.models.histori_lokasi import HistoriLokasi
from app.models.histori_status import HistoriStatus
from app.models.pemeliharaan import Pemeliharaan
from app.schemas.timeline import TimelineItem


def get_timeline(db: Session, armada_id: int) -> list[TimelineItem]:
    items: list[TimelineItem] = []

    for h in db.query(HistoriLokasi).filter(HistoriLokasi.armada_id == armada_id).all():
        items.append(
            TimelineItem(
                tanggal=h.created_at,
                jenis="pindah_lokasi",
                judul="Perpindahan Lokasi",
                deskripsi=h.keterangan,
            )
        )

    for h in db.query(HistoriStatus).filter(HistoriStatus.armada_id == armada_id).all():
        judul = f"Status → {h.status_baru.value}"
        if h.butuh_approval:
            judul += f" ({h.approval_status.value})"
        items.append(
            TimelineItem(tanggal=h.tanggal, jenis="ubah_status", judul=judul, deskripsi=h.keterangan)
        )

    for p in (
        db.query(Pemeliharaan)
        .filter(Pemeliharaan.armada_id == armada_id, Pemeliharaan.is_deleted.is_(False))
        .all()
    ):
        items.append(
            TimelineItem(
                tanggal=p.tanggal_input,
                jenis="pemeliharaan",
                judul=p.jenis_pekerjaan or "Pemeliharaan",
                deskripsi=p.keterangan,
            )
        )

    items.sort(key=lambda x: x.tanggal, reverse=True)
    return items
