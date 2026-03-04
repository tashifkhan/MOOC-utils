from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MOOC Notice Reminders API"
    debug: bool = False
    database_url: str = "sqlite://./data/db/db.sqlite3"

    swayam_base_url: str = "https://swayam.gov.in"
    nptel_base_url: str = "https://onlinecourses.nptel.ac.in"

    cache_ttl_minutes: int = 60

    telegram_bot_token: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    cors_origins: list[str] = ["http://localhost:3000"]

    jwt_secret: str
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    otp_expire_minutes: int = 10
    otp_delivery: str = "console"
    otp_length: int = 6

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
