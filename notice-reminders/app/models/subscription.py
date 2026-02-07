from __future__ import annotations

from typing import final

from tortoise import fields
from tortoise.models import Model

from app.models.course import Course
from app.models.user import User


@final
class Subscription(Model):
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User", related_name="subscriptions"
    )
    course: fields.ForeignKeyRelation[Course] = fields.ForeignKeyField(
        "models.Course", related_name="subscriptions"
    )
    created_at = fields.DatetimeField(auto_now_add=True)
    is_active = fields.BooleanField(default=True)

    @final
    class Meta:
        table = "subscriptions"
        unique_together = (("user", "course"),)
