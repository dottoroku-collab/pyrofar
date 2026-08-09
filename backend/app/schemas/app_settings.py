from pydantic import BaseModel, EmailStr


class AppSettingsResponse(BaseModel):
    id: int
    app_name: str
    app_short_name: str
    organization_name: str | None = None
    region_name: str | None = None
    logo_url: str | None = None
    primary_color: str
    secondary_color: str
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address: str | None = None

    class Config:
        from_attributes = True


class AppSettingsUpdate(BaseModel):
    app_name: str
    app_short_name: str
    organization_name: str | None = None
    region_name: str | None = None
    primary_color: str = "#C62828"
    secondary_color: str = "#263238"
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address: str | None = None