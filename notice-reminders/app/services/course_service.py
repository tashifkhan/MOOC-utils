from datetime import datetime, timedelta, timezone
from typing import final

from tortoise.expressions import Q

from app.core.config import Settings
from app.models.course import Course
from app.services.swayam_service import SwayamService


@final
class CourseService:
    def __init__(self, settings: Settings, swayam_service: SwayamService) -> None:
        self.settings = settings
        self.swayam_service = swayam_service

    async def search_and_cache(self, query: str) -> list[Course]:
        courses = await self.swayam_service.search_courses(query)
        stored: list[Course] = []

        for course in courses:
            record = await Course.get_or_none(code=course.code)

            if record:
                changed = False
                for field in [
                    "title",
                    "url",
                    "instructor",
                    "institute",
                    "nc_code",
                ]:
                    if getattr(record, field) != getattr(course, field):
                        setattr(record, field, getattr(course, field))
                        changed = True

                if changed:
                    await record.save()

                stored.append(record)
                continue

            stored.append(
                await Course.create(
                    code=course.code,
                    title=course.title,
                    url=course.url,
                    instructor=course.instructor,
                    institute=course.institute,
                    nc_code=course.nc_code,
                )
            )
        return stored

    async def list_courses(self) -> list[Course]:
        return await Course.all().order_by("title")

    async def get_by_code(self, course_code: str) -> Course | None:
        return await Course.get_or_none(code=course_code)

    async def get_recently_updated(self) -> list[Course]:
        cutoff = datetime.now(timezone.utc) - timedelta(
            minutes=self.settings.cache_ttl_minutes
        )
        return await Course.filter(Q(updated_at__gte=cutoff)).order_by("-updated_at")
