# config.py
"""Configuration settings loaded from environment variables.
Uses pydantic BaseSettings for type safety.
"""

import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="sqlite:///./test.db", env="DATABASE_URL")
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    # Add more settings as needed

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
