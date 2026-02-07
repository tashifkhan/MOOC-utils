from datetime import datetime

from pydantic import BaseModel


class AnnouncementResponse(BaseModel):
    id: int
    course_id: int
    title: str
    date: str
    content: str
    fetched_at: datetime

    class Config:
        from_attributes = True
