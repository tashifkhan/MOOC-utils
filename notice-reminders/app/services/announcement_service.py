from typing import final

from tortoise.expressions import Q

from app.core.config import Settings
from app.models.announcement import Announcement
from app.models.course import Course
from app.services.swayam_service import SwayamService


@final
class AnnouncementService:
    def __init__(self, settings: Settings, swayam_service: SwayamService) -> None:
        self.settings = settings
        self.swayam_service = swayam_service

    async def fetch_and_cache(self, course: Course) -> list[Announcement]:
        announcements = await self.swayam_service.get_announcements(course.code)
        stored: list[Announcement] = []

        for item in announcements:
            record = await Announcement.get_or_none(
                Q(course=course) & Q(title=item.title) & Q(date=item.date)
            )

            if record:
                if record.content != item.content:
                    record.content = item.content
                    await record.save()
                stored.append(record)
                continue

            stored.append(
                await Announcement.create(
                    course=course,
                    title=item.title,
                    date=item.date,
                    content=item.content,
                )
            )
        return stored

    async def list_for_course(self, course: Course) -> list[Announcement]:
        return await Announcement.filter(course=course).order_by("-fetched_at")
