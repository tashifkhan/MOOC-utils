from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import (
    get_course_service,
    get_subscription_service,
    get_user_service,
)
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse
from app.services.course_service import CourseService
from app.services.subscription_service import SubscriptionService
from app.services.user_service import UserService

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post(
    "", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED
)
async def create_subscription(
    payload: SubscriptionCreate,
    subscription_service: SubscriptionService = Depends(get_subscription_service),
    user_service: UserService = Depends(get_user_service),
    course_service: CourseService = Depends(get_course_service),
) -> SubscriptionResponse:
    user = await user_service.get_user(payload.user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    course = await course_service.get_by_code(payload.course_code)
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    subscription = await subscription_service.subscribe(user, course)
    return SubscriptionResponse.model_validate(subscription)


@router.get("", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    service: SubscriptionService = Depends(get_subscription_service),
) -> list[SubscriptionResponse]:
    subscriptions = await service.list_subscriptions()
    return [SubscriptionResponse.model_validate(item) for item in subscriptions]


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    subscription_id: int,
    service: SubscriptionService = Depends(get_subscription_service),
) -> None:
    from app.models.subscription import Subscription

    subscription = await Subscription.get_or_none(id=subscription_id)

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found",
        )

    await service.delete(subscription)
