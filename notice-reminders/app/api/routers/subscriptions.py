from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_auth
from app.core.dependencies import (
    get_course_service,
    get_subscription_service,
)
from app.models.user import User
from app.schemas.subscription import SubscriptionCreate, SubscriptionResponse
from app.services.course_service import CourseService
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post(
    "", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED
)
@require_auth
async def create_subscription(
    payload: SubscriptionCreate,
    current_user: User,
    subscription_service: SubscriptionService = Depends(get_subscription_service),
    course_service: CourseService = Depends(get_course_service),
) -> SubscriptionResponse:
    course = await course_service.get_by_code(payload.course_code)
    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    subscription = await subscription_service.subscribe(current_user, course)
    return SubscriptionResponse.model_validate(subscription)


@router.get("", response_model=list[SubscriptionResponse])
@require_auth
async def list_subscriptions(
    current_user: User,
    service: SubscriptionService = Depends(get_subscription_service),
) -> list[SubscriptionResponse]:
    subscriptions = await service.list_for_user(current_user)
    return [SubscriptionResponse.model_validate(item) for item in subscriptions]


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
@require_auth
async def delete_subscription(
    subscription_id: int,
    current_user: User,
    service: SubscriptionService = Depends(get_subscription_service),
) -> None:
    from app.models.subscription import Subscription

    subscription = await Subscription.get_or_none(id=subscription_id)

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found",
        )

    if subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    await service.delete(subscription)
