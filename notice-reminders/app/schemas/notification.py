from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    subscription_id: int
    announcement_id: int
    channel_id: int | None
    sent_at: datetime
    is_read: bool

    class Config:
        from_attributes = True
