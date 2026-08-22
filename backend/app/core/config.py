from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PYROFAR - Integrated Fire & Rescue Operations Platform"
    api_v1_prefix: str = "/api/v1"

    database_url: str
    jwt_secret_key: str

    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 7

    cors_origins: list[str] = []

    # WhatsApp Gateway Settings
    wa_enabled: bool = True
    wa_provider: str = "fonnte"  # Options: "fonnte", "evolution", "generic"
    wa_api_token: str = ""
    wa_api_url: str = "https://api.fonnte.com/send"
    wa_siaga_target: str = ""  # e.g., Group ID "12036301234567890@g.us" or Phone Number "08123456789"
    wa_instance_name: str = "sim-armada"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
