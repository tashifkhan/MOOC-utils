from typing import final

from tortoise import fields
from tortoise.models import Model


@final
class Course(Model):
    id = fields.IntField(pk=True)
    code = fields.CharField(max_length=50, unique=True, index=True)
    title = fields.CharField(max_length=255)
    url = fields.CharField(max_length=500)
    instructor = fields.CharField(max_length=255)
    institute = fields.CharField(max_length=255)
    nc_code = fields.CharField(max_length=50)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    @final
    class Meta:
        table = "courses"
