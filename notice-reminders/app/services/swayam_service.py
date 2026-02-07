"""Swayam scraping service integration."""

from typing import final

from app.core.config import Settings
from app.domain.models import Announcement, Course
from app.scrapers import SwayamScraper


@final
class SwayamService:
    """Service to interact with Swayam scraper."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.scraper = SwayamScraper()

    async def search_courses(self, query: str) -> list[Course]:
        """Search for courses."""
        return await self.scraper.search_courses(query)

    async def get_announcements(self, course_code: str) -> list[Announcement]:
        """Get announcements for a course."""
        return await self.scraper.get_announcements(course_code)
