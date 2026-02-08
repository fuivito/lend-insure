from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    PORT: int = 3001
    ENVIRONMENT: str = "development"

    # Supabase configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    # Invitation settings
    INVITATION_EXPIRY_HOURS: int = 72
    INVITATION_BASE_URL: str = "http://localhost:8080/accept-invite"

    class Config:
        print("Config class")
        env_file = ".env"
        # model_config = SettingsConfigDict(env_file='.env')

settings = Settings()
