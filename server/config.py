from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    PORT: int = 3001
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
