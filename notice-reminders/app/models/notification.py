from __future__ import annotations

from typing import final

from tortoise import fields
from tortoise.models import Model

from app.models.announcement import Announcement
from app.models.notification_channel import NotificationChannel
from app.models.subscription import Subscription
from app.models.user import User


@final
class Notification(Model):
    id = fields.IntField(pk=True)
    user: fields.ForeignKeyRelation[User] = fields.ForeignKeyField(
        "models.User", related_name="notifications"
    )
    subscription: fields.ForeignKeyRelation[Subscription] = fields.ForeignKeyField(
        "models.Subscription", related_name="notifications"
    )
    announcement: fields.ForeignKeyRelation[Announcement] = fields.ForeignKeyField(
        "models.Announcement", related_name="notifications"
    )
    channel: fields.ForeignKeyRelation[NotificationChannel] | None = (
        fields.ForeignKeyField(
            "models.NotificationChannel", related_name="notifications", null=True
        )
    )
    sent_at = fields.DatetimeField(auto_now_add=True)
    is_read = fields.BooleanField(default=False)

    @final
    class Meta:
        table = "notifications"
