from datetime import datetime

from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    course_code: str


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
