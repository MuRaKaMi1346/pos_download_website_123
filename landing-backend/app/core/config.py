"""Application settings, loaded from environment / .env via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# landing-backend/ — two levels up from app/core/config.py
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Typed application settings. Field names map to UPPER_SNAKE env vars."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    debug: bool = False
    secret: str = "dev-secret-change-me"
    admin_token: str = "dev-admin-token-change-me"

    database_url: str = f"sqlite:///{(BASE_DIR / 'landing.db').as_posix()}"
    releases_dir: Path = BASE_DIR / "releases"

    cors_origins: str = (
        "https://smartbrew.app,"
        "http://localhost:4321,http://localhost:4322,http://localhost:4323,"
        "http://localhost:5173"
    )

    # Optional SMTP — contact messages are still stored if these are unset.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@smartbrew.app"
    contact_to: str = "team@smartbrew.app"

    newsletter_double_opt_in: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
