from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    telegram_id: str | None = None
    notify_telegram: bool = False
    notify_email: bool = False
    notification_email: EmailStr | None = None


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    name: str | None = None
    telegram_id: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None
    telegram_id: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
