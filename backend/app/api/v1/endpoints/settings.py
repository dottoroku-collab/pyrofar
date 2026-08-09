from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from PIL import Image
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.app_settings import (
    AppSettingsResponse,
    AppSettingsUpdate,
)
from app.services import settings_service


router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)


BASE_DIR = Path(__file__).resolve().parents[4]
UPLOAD_DIR = BASE_DIR / "uploads" / "logos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.get(
    "",
    response_model=AppSettingsResponse,
)
def get_app_settings(
    db: Session = Depends(get_db),
):
    return settings_service.get_settings(db)


@router.put(
    "",
    response_model=AppSettingsResponse,
)
def update_app_settings(
    payload: AppSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Administrator yang dapat mengubah pengaturan aplikasi",
        )

    return settings_service.update_settings(
        db,
        payload.model_dump(),
    )


@router.post(
    "/logo",
    response_model=AppSettingsResponse,
)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Administrator yang dapat mengubah logo aplikasi",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format logo harus JPG, PNG, atau WebP",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ukuran logo maksimal 5 MB",
        )

    try:
        from io import BytesIO

        image = Image.open(BytesIO(content))
        image.verify()

        image = Image.open(BytesIO(content)).convert("RGBA")

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File yang diunggah bukan gambar yang valid",
        )

    # Ukuran standar logo aplikasi
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)

    # Buat canvas 512x512 agar logo konsisten
    canvas = Image.new(
        "RGBA",
        (512, 512),
        (255, 255, 255, 0),
    )

    x = (512 - image.width) // 2
    y = (512 - image.height) // 2

    canvas.alpha_composite(image, (x, y))

    filename = f"logo-{uuid4().hex}.webp"
    filepath = UPLOAD_DIR / filename

    canvas.save(
        filepath,
        "WEBP",
        quality=90,
        method=6,
    )

    app_settings = settings_service.get_settings(db)

    # Hapus logo lama jika berasal dari storage lokal
    if app_settings.logo_url:
        old_filename = Path(app_settings.logo_url).name
        old_file = UPLOAD_DIR / old_filename

        if old_file.exists():
            old_file.unlink()

    app_settings.logo_url = f"/uploads/logos/{filename}"

    db.add(app_settings)
    db.commit()
    db.refresh(app_settings)

    return app_settings


@router.delete(
    "/logo",
    response_model=AppSettingsResponse,
)
def delete_logo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.administrator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Administrator yang dapat menghapus logo aplikasi",
        )

    app_settings = settings_service.get_settings(db)

    if app_settings.logo_url:
        filename = Path(app_settings.logo_url).name
        filepath = UPLOAD_DIR / filename

        if filepath.exists():
            filepath.unlink()

    app_settings.logo_url = None

    db.add(app_settings)
    db.commit()
    db.refresh(app_settings)

    return app_settings