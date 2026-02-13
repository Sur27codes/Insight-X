from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "InsightX"
    API_V1_STR: str = "/api"
    
    # Text Inputs
    USER_PROMPT: str = "Default prompt"
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    
    # MLflow
    MLFLOW_TRACKING_URI: str
    
    class Config:
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
