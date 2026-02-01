import httpx
from bs4 import BeautifulSoup
import re
import urllib.parse
from datetime import datetime
from models import Course, Announcement


class SwayamClient:
    BASE_URL = "https://swayam.gov.in"
    NPTEL_BASE_URL = "https://onlinecourses.nptel.ac.in"

    # Headers from user request
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
        url = f"{self.BASE_URL}/search_courses"
        params = {"searchText": query}

        async with httpx.AsyncClient(
            headers=self.HEADERS, follow_redirects=True
        ) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            return self._parse_search_results(response.text)

    def _parse_search_results(self, html: str) -> list[Course]:
        soup = BeautifulSoup(html, "html.parser")
        courses = []

        # Find all course cards
        # Based on HTML: <div class="col-md-3 ..."> <a href="..."> <div class="es-course-card"> ...

        # We look for the <a> tag that contains the course card
        course_links = soup.find_all("a", href=True)

        for link in course_links:
            card = link.find("div", class_="es-course-card")
            if not card:
                continue

            course_url = link["href"]

            # Extract basic info
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

            # Extract NC (National Coordinator) - e.g. NPTEL, IIMB
            # Structure: <div class="row" ...> ... <strong class="text-danger">NPTEL</strong>
            nc_elem = card.find("strong", class_="text-danger")
            nc_code = nc_elem.get_text(strip=True) if nc_elem else "Unknown NC"

            # Extract course code from URL
            # URL format: https://onlinecourses.nptel.ac.in/noc26_ee12/preview
            # OR https://onlinecourses.swayam2.ac.in/imb26_mg150/preview
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
        # Determine the base domain.
        # Most are on onlinecourses.nptel.ac.in but some (like IIMB) might be on onlinecourses.swayam2.ac.in
        # For now, we will construct the URL dynamically or default to NPTEL if not provided.
        # However, the user request specifically mentioned:
        # "request this website https://onlinecourses.nptel.ac.in/noc26_ee12/announcements with the code"
        # So I will stick to that pattern for NPTEL courses, but be robust enough to handle the passed course URL if I can.

        # Better approach: We don't have the full base URL stored in the 'code', but we have the 'url' in Course object.
        # But here we only pass course_code.
        # Let's try to assume nptel domain for now based on the prompt's explicit instruction.
        # "then request this website https://onlinecourses.nptel.ac.in/noc26_ee12/announcements"

        url = f"{self.NPTEL_BASE_URL}/{course_code}/announcements"

        async with httpx.AsyncClient(
            headers=self.HEADERS, follow_redirects=True
        ) as client:
            response = await client.get(url)

            # If 404, maybe try swayam2 domain?
            # The prompt example shows different domains in search results:
            # https://onlinecourses.swayam2.ac.in/imb26_mg150/preview
            # https://onlinecourses.nptel.ac.in/noc26_hs77/preview
            if response.status_code == 404:
                # Try swayam2
                url = f"https://onlinecourses.swayam2.ac.in/{course_code}/announcements"
                response = await client.get(url)

            response.raise_for_status()
            return self._parse_announcements(response.text)

    def _parse_announcements(self, html: str) -> list[Announcement]:
        soup = BeautifulSoup(html, "html.parser")
        announcements = []

        # Based on HTML structure provided:
        # <div class="gcb-aside"> ... <h2> ... <span class="gcb-announcement-title"> ...
        # <p> <script>...</script>2026-01-30 </p>
        # <p class="gcb-announcement-content" ...> ... </p>

        # We need to find the container. It seems announcements are inside <div class="gcb-aside">
        # and separated by <hr>. But let's look for h2 tags with announcement titles.

        titles = soup.find_all("span", class_="gcb-announcement-title")

        for title_span in titles:
            # Title is inside an h2
            h2 = title_span.parent
            if not h2:
                continue

            title_text = title_span.get_text(strip=True)

            # The date is in the NEXT sibling element (a <p> tag)
            # Structure: <h2>...</h2> <p><script>...</script>DATE</p>
            date_p = h2.find_next_sibling("p")
            date_text = "Unknown Date"
            if date_p:
                # Debug print
                # print(f"DEBUG: date_p: {date_p}")
                parts = []
                for element in date_p.children:
                    if element.name == "script":
                        continue
                    if isinstance(element, str):
                        parts.append(element.strip())
                    elif hasattr(element, "get_text"):
                        parts.append(element.get_text(strip=True))

                date_text = " ".join(filter(None, parts))

                # If date_text is still empty, try to parse from script
                if not date_text:
                    script = date_p.find("script")
                    if script and script.string:
                        # Match: var date = new Date(1769731200000.0);
                        match = re.search(r"new Date\(([\d\.]+)\)", script.string)
                        if match:
                            ts = float(match.group(1))
                            # JS timestamp is in milliseconds
                            dt = datetime.fromtimestamp(ts / 1000.0)
                            date_text = dt.strftime("%Y-%m-%d")

            # The content is in the NEXT sibling <p> with class gcb-announcement-content
            content_p = (
                date_p.find_next_sibling("p", class_="gcb-announcement-content")
                if date_p
                else None
            )
            content_text = ""
            if content_p:
                # We want readable text, maybe preserve newlines for divs
                # The example has <div class="yui-wk-div">...</div>
                # get_text(separator='\n') is good.
                content_text = content_p.get_text(separator="\n", strip=True)

            announcements.append(
                Announcement(title=title_text, date=date_text, content=content_text)
            )

        return announcements
