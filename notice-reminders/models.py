from dataclasses import dataclass


@dataclass
class Course:
    title: str
    url: str
    code: str
    instructor: str
    institute: str
    nc_code: str  # National Coordinator (e.g., NPTEL, IIMB)

    def __str__(self):
        return f"{self.title} - {self.instructor} ({self.institute}) - {self.nc_code}"


@dataclass
class Announcement:
    title: str
    date: str
    content: str

    def __str__(self):
        return f"[{self.date}] {self.title}\n{'-' * 40}\n{self.content}\n"
