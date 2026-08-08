from datetime import datetime

from pydantic import BaseModel

from app.models.armada_file import JenisFileArmada


class ArmadaFilePublic(BaseModel):
    id: int
    armada_id: int
    jenis_file: JenisFileArmada
    file_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
