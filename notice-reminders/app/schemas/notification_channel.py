from datetime import datetime

from pydantic import BaseModel


class NotificationChannelCreate(BaseModel):
    user_id: int
    channel: str
    address: str
    is_active: bool = True


class NotificationChannelResponse(BaseModel):
    id: int
    user_id: int
    channel: str
    address: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
