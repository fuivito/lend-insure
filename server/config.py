from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    PORT: int = 3001
    ENVIRONMENT: str = "development"
    
    class Config:
        print("Config class")
        env_file = ".env"
        # model_config = SettingsConfigDict(env_file='.env')

settings = Settings()
