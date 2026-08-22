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
    personnel_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    dashboard_video_url: str | None = None
    dashboard_image_url: str | None = None
    dashboard_running_text: str | None = None

    # WhatsApp Gateway Settings
    wa_enabled: bool = True
    wa_provider: str = "fonnte"
    wa_api_token: str | None = None
    wa_api_url: str | None = "https://api.fonnte.com/send"
    wa_siaga_target: str | None = None
    wa_instance_name: str | None = "sim-armada"

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
    personnel_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    dashboard_video_url: str | None = None
    dashboard_image_url: str | None = None
    dashboard_running_text: str | None = None

    # WhatsApp Gateway Settings
    wa_enabled: bool | None = None
    wa_provider: str | None = None
    wa_api_token: str | None = None
    wa_api_url: str | None = None
    wa_siaga_target: str | None = None
    wa_instance_name: str | None = None