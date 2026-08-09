import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from reportlab.lib import colors as pdf_colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role, require_feature
from app.models.armada import Armada
from app.models.user import UserRole

router = APIRouter(prefix="/laporan", tags=["Laporan"])

ALLOWED_ROLES = [UserRole.administrator, UserRole.pimpinan, UserRole.kabid]

HEADERS = ["Kode Armada", "Nama", "No. Polisi", "No. Lambung", "Status", "Tahun"]


def _filtered_armada(
    db: Session, jenis_id: int | None, lokasi_id: int | None, status_armada: str | None
):
    query = db.query(Armada).filter(Armada.is_deleted.is_(False))
    if jenis_id:
        query = query.filter(Armada.jenis_kendaraan_id == jenis_id)
    if lokasi_id:
        query = query.filter(Armada.lokasi_saat_ini_id == lokasi_id)
    if status_armada:
        query = query.filter(Armada.status_armada == status_armada)
    return query.order_by(Armada.kode_armada).all()


def _rows(armada_list: list[Armada]) -> list[list[str]]:
    return [
        [
            a.kode_armada,
            a.nama_armada or "",
            a.no_polisi or "",
            a.no_lambung or "",
            a.status_armada.value,
            str(a.tahun or ""),
        ]
        for a in armada_list
    ]


@router.get("/export", dependencies=[Depends(require_feature("export_laporan"))])
def export_laporan(
    format: str = Query("excel", pattern="^(excel|pdf)$"),
    jenis_id: int | None = None,
    lokasi_id: int | None = None,
    status_armada: str | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_role(ALLOWED_ROLES)),
):
    armada_list = _filtered_armada(db, jenis_id, lokasi_id, status_armada)
    rows = _rows(armada_list)

    if format == "excel":
        wb = Workbook()
        ws = wb.active
        ws.title = "Laporan Armada"
        ws.append(HEADERS)
        for row in rows:
            ws.append(row)
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=laporan-armada.xlsx"},
        )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    table_data = [HEADERS] + rows
    table = Table(table_data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), pdf_colors.HexColor("#C0272D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), pdf_colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, pdf_colors.grey),
            ]
        )
    )
    doc.build([table])
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=laporan-armada.pdf"},
    )
