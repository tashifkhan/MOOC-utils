from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import require_auth
from app.core.dependencies import get_notification_service
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
@require_auth
async def list_notifications(
    current_user: User,
    service: NotificationService = Depends(get_notification_service),
) -> list[NotificationResponse]:
    notifications = await service.list_for_user(current_user.id)
    return [NotificationResponse.model_validate(item) for item in notifications]


@router.get("/users/{user_id}", response_model=list[NotificationResponse])
@require_auth
async def list_notifications_for_user(
    user_id: int,
    current_user: User,
    service: NotificationService = Depends(get_notification_service),
) -> list[NotificationResponse]:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )
    notifications = await service.list_for_user(user_id)
    return [NotificationResponse.model_validate(item) for item in notifications]


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
@require_auth
async def mark_read(
    notification_id: int,
    current_user: User,
    service: NotificationService = Depends(get_notification_service),
) -> NotificationResponse:
    notification = await Notification.get_or_none(id=notification_id)
    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification_user = await notification.user
    if notification_user.id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    updated = await service.mark_read(notification)
    return NotificationResponse.model_validate(updated)
