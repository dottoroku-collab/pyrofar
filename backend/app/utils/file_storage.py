import os
import uuid
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = "uploads"
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}

# S3 / MinIO settings
S3_ENDPOINT = os.getenv("MINIO_ENDPOINT")
S3_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
S3_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "sim-armada-uploads")

s3_client = None
if S3_ENDPOINT and S3_ACCESS_KEY and S3_SECRET_KEY:
    s3_client = boto3.client(
        "s3",
        endpoint_url=f"http://{S3_ENDPOINT}",
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name="us-east-1"
    )
    # Ensure bucket exists
    try:
        s3_client.head_bucket(Bucket=S3_BUCKET_NAME)
    except ClientError as e:
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            s3_client.create_bucket(Bucket=S3_BUCKET_NAME)


def save_upload(file: UploadFile, subfolder: str = "") -> str:
    """Simpan file ke S3/MinIO atau fallback ke disk lokal."""
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

    filename = f"{uuid.uuid4().hex}{ext}"
    
    if s3_client:
        object_name = f"{subfolder}/{filename}" if subfolder else filename
        try:
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=object_name,
                Body=content,
                ContentType=file.content_type
            )
            # URL depends on how MinIO is accessed from the outside (through proxy)
            # We configured /s3/ proxy in Nginx to point to MinIO
            return f"/s3/{S3_BUCKET_NAME}/{object_name}"
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Gagal mengunggah file ke object storage: {str(e)}"
            )
    else:
        # Fallback to local storage
        folder = os.path.join(UPLOAD_ROOT, subfolder)
        os.makedirs(folder, exist_ok=True)
        filepath = os.path.join(folder, filename)
        with open(filepath, "wb") as f:
            f.write(content)

        return f"/{filepath}"
