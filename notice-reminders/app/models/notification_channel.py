from __future__ import annotations

from typing import final

from tortoise import fields
from tortoise.models import Model

from app.models.user import User


@final
class NotificationChannel(Model):
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User", related_name="notification_channels"
    )
    channel = fields.CharField(max_length=50)
    address = fields.CharField(max_length=255)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    @final
    class Meta:
        table = "notification_channels"
        unique_together = (("user", "channel", "address"),)
