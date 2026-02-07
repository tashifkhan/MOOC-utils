from __future__ import annotations

from typing import final

from tortoise import fields
from tortoise.models import Model

from app.models.course import Course


@final
class Announcement(Model):
    id = fields.IntField(pk=True)
    course: fields.ForeignKeyRelation[Course] = fields.ForeignKeyField(
        "models.Course", related_name="announcements"
    )
    title = fields.CharField(max_length=500)
    date = fields.CharField(max_length=50)
    content = fields.TextField()
    fetched_at = fields.DatetimeField(auto_now_add=True)

    @final
    class Meta:
        table = "announcements"
