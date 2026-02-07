from typing import final

from tortoise import fields
from tortoise.models import Model


@final
class User(Model):
    id = fields.IntField(pk=True)
    email = fields.CharField(max_length=255, unique=True, index=True)
    name = fields.CharField(max_length=255, null=True)
    telegram_id = fields.CharField(max_length=100, null=True, unique=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    @final
    class Meta:
        table = "users"
