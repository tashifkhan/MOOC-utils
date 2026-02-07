from datetime import datetime

from pydantic import BaseModel


class CourseResponse(BaseModel):
    id: int
    code: str
    title: str
    url: str
    instructor: str
    institute: str
    nc_code: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
