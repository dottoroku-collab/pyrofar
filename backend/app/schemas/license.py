from datetime import datetime

from pydantic import BaseModel, Field


class LicenseActivateRequest(BaseModel):
    license_key: str = Field(
        min_length=10,
        max_length=2048,
    )


class LicenseResponse(BaseModel):
    id: int
    license_id: str
    plan_code: str
    plan_name: str
    organization_name: str | None = None
    issued_at: datetime
    expires_at: datetime
    max_users: int | None = None
    max_armada: int | None = None
    features: list[str]
    is_active: bool
    activated_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class LicenseStatusResponse(BaseModel):
    activated: bool
    license: LicenseResponse | None = None


class LicenseGenerateRequest(BaseModel):
    plan_code: str
    organization_name: str
    years: int = 1


class LicenseGenerateResponse(BaseModel):
    license_key: str
    license_id: str
    expires_at: str