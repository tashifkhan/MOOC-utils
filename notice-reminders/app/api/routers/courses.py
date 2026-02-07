from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_course_service
from app.schemas.course import CourseResponse
from app.services.course_service import CourseService

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseResponse])
async def list_courses(
    service: CourseService = Depends(get_course_service),
) -> list[CourseResponse]:
    courses = await service.list_courses()
    return [CourseResponse.model_validate(course) for course in courses]


@router.get("/{course_code}", response_model=CourseResponse)
async def get_course(
    course_code: str,
    service: CourseService = Depends(get_course_service),
) -> CourseResponse:
    course = await service.get_by_code(course_code)

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return CourseResponse.model_validate(course)
