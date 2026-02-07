"""Domain models (Dataclasses) for notice-reminders."""

from dataclasses import dataclass
from typing_extensions import override


@dataclass
class Course:
    """Represents a MOOC course (Domain Entity)."""

    title: str
    url: str
    code: str
    instructor: str
    institute: str
    nc_code: str  # National Coordinator (e.g., NPTEL, IIMB)

    @override
    def __str__(self) -> str:
        return f"{self.title} - {self.instructor} ({self.institute}) - {self.nc_code}"


@dataclass
class Announcement:
    """Represents a course announcement (Domain Entity)."""

    title: str
    date: str
    content: str

    @override
    def __str__(self) -> str:
        return f"[{self.date}] {self.title}\n{'-' * 40}\n{self.content}\n"
