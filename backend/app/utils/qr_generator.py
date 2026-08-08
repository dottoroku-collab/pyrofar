import uuid


def generate_qr_code_value(kode_armada: str) -> str:
    """Nilai unik untuk QR Code — gambar QR di-generate on-the-fly di frontend
    (mis. komponen <QRCode> Ant Design) dari nilai ini, sesuai catatan desain Tahap 5.
    """
    return f"{kode_armada}-{uuid.uuid4().hex[:8]}"
