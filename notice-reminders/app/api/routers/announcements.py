from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_announcement_service, get_course_service
from app.schemas.announcement import AnnouncementResponse
from app.services.announcement_service import AnnouncementService
from app.services.course_service import CourseService

router = APIRouter(
    prefix="/courses/{course_code}/announcements", tags=["announcements"]
)


@router.get("", response_model=list[AnnouncementResponse])
async def list_announcements(
    course_code: str,
    course_service: CourseService = Depends(get_course_service),
    announcement_service: AnnouncementService = Depends(get_announcement_service),
) -> list[AnnouncementResponse]:
    course = await course_service.get_by_code(course_code)

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    announcements = await announcement_service.fetch_and_cache(course)
    return [AnnouncementResponse.model_validate(item) for item in announcements]
