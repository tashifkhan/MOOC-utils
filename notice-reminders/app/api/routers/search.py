from fastapi import APIRouter, Depends

from app.core.dependencies import get_course_service
from app.schemas.course import CourseResponse
from app.services.course_service import CourseService

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[CourseResponse])
async def search_courses(
    q: str,
    service: CourseService = Depends(get_course_service),
) -> list[CourseResponse]:
    courses = await service.search_and_cache(q)
    return [CourseResponse.model_validate(course) for course in courses]
