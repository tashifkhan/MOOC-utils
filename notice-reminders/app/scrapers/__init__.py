"""Swayam course scraper - shared between CLI and API."""

import re
from datetime import datetime
from typing import final

import httpx
from bs4 import BeautifulSoup
from bs4.element import NavigableString, Tag

from app.domain.models import Announcement, Course


@final
class SwayamScraper:
    """Scraper for Swayam/NPTEL courses and announcements."""

    BASE_URL = "https://swayam.gov.in"
    NPTEL_BASE_URL = "https://onlinecourses.nptel.ac.in"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Referer": "https://swayam.gov.in/",
        "DNT": "1",
        "Sec-GPC": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
    }

    async def search_courses(self, query: str) -> list[Course]:
        """Search for courses by query string."""
        url = f"{self.BASE_URL}/search_courses"
        params = {"searchText": query}

        async with httpx.AsyncClient(
            headers=self.HEADERS, follow_redirects=True
        ) as client:
            response = await client.get(url, params=params)
            _ = response.raise_for_status()
            return self._parse_search_results(response.text)

    def _parse_search_results(self, html: str) -> list[Course]:
        """Parse HTML search results into Course objects."""
        soup = BeautifulSoup(html, "html.parser")
        courses: list[Course] = []

        course_links = soup.find_all("a", href=True)

        for link in course_links:
            card = link.find("div", class_="es-course-card")
            if not card:
                continue

            course_url = link.get("href")
            if not isinstance(course_url, str):
                continue

            title_elem = card.find("h4", class_="courseTitle")
            title = title_elem.get_text(strip=True) if title_elem else "Unknown Title"

            instructor_div = card.find("div", class_="courseInstructor")
            instructor = (
                instructor_div.get_text(strip=True)
                if instructor_div
                else "Unknown Instructor"
            )

            institute_div = card.find("div", class_="courseInstitute")
            institute = (
                institute_div.get_text(strip=True)
                if institute_div
                else "Unknown Institute"
            )

            nc_elem = card.find("strong", class_="text-danger")
            nc_code = nc_elem.get_text(strip=True) if nc_elem else "Unknown NC"

            code_match = re.search(r"/([^/]+)/preview", course_url)
            code = code_match.group(1) if code_match else ""

            if code:
                courses.append(
                    Course(
                        title=title,
                        url=course_url,
                        code=code,
                        instructor=instructor,
                        institute=institute,
                        nc_code=nc_code,
                    )
                )

        return courses

    async def get_announcements(self, course_code: str) -> list[Announcement]:
        """Fetch announcements for a course by its code."""
        url = f"{self.NPTEL_BASE_URL}/{course_code}/announcements"

        async with httpx.AsyncClient(
            headers=self.HEADERS, follow_redirects=True
        ) as client:
            response = await client.get(url)

            if response.status_code == 404:
                url = f"https://onlinecourses.swayam2.ac.in/{course_code}/announcements"
                response = await client.get(url)

            _ = response.raise_for_status()
            return self._parse_announcements(response.text)

    def _parse_announcements(self, html: str) -> list[Announcement]:
        """Parse HTML announcements into Announcement objects."""
        soup = BeautifulSoup(html, "html.parser")
        announcements: list[Announcement] = []

        titles = soup.find_all("span", class_="gcb-announcement-title")

        for title_span in titles:
            h2 = title_span.parent
            if not h2 or not isinstance(h2, Tag):
                continue

            title_text = title_span.get_text(strip=True)

            date_p = h2.find_next_sibling("p")
            date_text = "Unknown Date"
            if date_p:
                parts = []
                for element in date_p.children:
                    if getattr(element, "name", None) == "script":
                        continue
                    if isinstance(element, NavigableString):
                        parts.append(element.strip())
                    elif hasattr(element, "get_text"):
                        parts.append(element.get_text(strip=True))

                date_text = " ".join(filter(None, parts))

                if not date_text:
                    script = date_p.find("script")
                    if script and script.string:
                        match = re.search(r"new Date\(([\d\.]+)\)", script.string)
                        if match:
                            ts = float(match.group(1))
                            dt = datetime.fromtimestamp(ts / 1000.0)
                            date_text = dt.strftime("%Y-%m-%d")

            content_p = (
                date_p.find_next_sibling("p", class_="gcb-announcement-content")
                if date_p
                else None
            )
            content_text = ""
            if content_p:
                content_text = content_p.get_text(separator="\n", strip=True)

            announcements.append(
                Announcement(title=title_text, date=date_text, content=content_text)
            )

        return announcements
