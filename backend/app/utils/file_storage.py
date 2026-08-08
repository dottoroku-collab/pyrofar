import os
import uuid

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = "uploads"
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


def save_upload(file: UploadFile, subfolder: str = "") -> str:
    """Simpan file ke disk lokal, kembalikan URL relatif.

    Validasi (hardening Sprint 7):
    - Ekstensi harus salah satu dari ALLOWED_EXTENSIONS (cegah upload file executable/script)
    - Ukuran maksimum MAX_FILE_SIZE_BYTES

    Sprint lanjutan (di luar cakupan proyek ini): ganti ke object storage (S3/MinIO)
    agar file tidak hilang saat container di-redeploy dan agar validasi tipe file
    dapat diperkuat dengan pengecekan magic bytes, bukan hanya ekstensi.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipe file '{ext or '(tanpa ekstensi)'}' tidak diizinkan. "
            f"Hanya: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = file.file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ukuran file melebihi batas {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB",
        )

    folder = os.path.join(UPLOAD_ROOT, subfolder)
    os.makedirs(folder, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    return f"/{filepath}"
