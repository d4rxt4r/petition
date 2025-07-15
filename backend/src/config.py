from pathlib import Path
from datetime import timedelta
from pydantic_settings import BaseSettings, SettingsConfigDict
from authx import AuthXConfig

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"


class Settings(BaseSettings):
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    SECRET: str
    JWT_SECRET_KEY: str
    YCAPTCHA_SERVER_KEY: str
    SMS_EMAIL: str
    SMS_API_KEY: str
    SMS_SIGN: str

    BASE_DIR: Path = BASE_DIR
    STATIC_DIR: Path = STATIC_DIR

    model_config = SettingsConfigDict(extra="ignore")


settings = Settings()  # pyright: ignore


# WARNING: CSRF IS OFF!
authx_config = AuthXConfig(
    JWT_SECRET_KEY=settings.JWT_SECRET_KEY,  # ваш секрет для JWT
    JWT_ALGORITHM="HS256",  # алгоритм подписи
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=3),  # жизнь access‑токена
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=15),  # жизнь refresh‑токена
    JWT_TOKEN_LOCATION=["cookies"],  # искать токены именно в куки
    JWT_COOKIE_SECURE=True,  # Secure-флаг для куки (HTTPS)
    JWT_COOKIE_SAMESITE="lax",  # SameSite‑политика
    JWT_COOKIE_CSRF_PROTECT=False,  # включить CSRF‑защиту
    JWT_ACCESS_COOKIE_NAME="access_token",
    JWT_REFRESH_COOKIE_NAME="refresh_token",
)


def get_db_url() -> str:
    return (
        f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@"
        f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    )
