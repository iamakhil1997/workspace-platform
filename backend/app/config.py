# config.py
"""Configuration settings loaded from environment variables.
Uses pydantic BaseSettings for type safety.
"""

import os
from pydantic import Field, BaseSettings
# from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite:///./test_v3.db", env="DATABASE_URL")
    SECRET_KEY: str = Field(default="temporary_secret_key_change_me", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    
    # SMTP Settings
    SMTP_SERVER: str = Field(default="smtp.gmail.com", env="SMTP_SERVER")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USERNAME: str = Field(default="", env="SMTP_USERNAME")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
