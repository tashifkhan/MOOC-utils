from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_auth
from app.core.dependencies import get_notification_channel_service, get_user_service
from app.models.user import User
from app.schemas.notification_channel import (
    NotificationChannelCreate,
    NotificationChannelResponse,
)
from app.schemas.user import UserResponse, UserUpdate
from app.services.notification_channel_service import NotificationChannelService
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
@require_auth
async def get_user(
    user_id: int,
    current_user: User,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
@require_auth
async def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: User,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    updated = await service.update_user(user, payload)
    return UserResponse.model_validate(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@require_auth
async def delete_user(
    user_id: int,
    current_user: User,
    service: UserService = Depends(get_user_service),
) -> None:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    await service.delete_user(user)


@router.post(
    "/{user_id}/channels",
    response_model=NotificationChannelResponse,
    status_code=status.HTTP_201_CREATED,
)
@require_auth
async def add_channel(
    user_id: int,
    payload: NotificationChannelCreate,
    current_user: User,
    service: NotificationChannelService = Depends(get_notification_channel_service),
    user_service: UserService = Depends(get_user_service),
) -> NotificationChannelResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    if payload.channel == "telegram" and not payload.address:
        raise HTTPException(
            status_code=400,
            detail="address required when channel is telegram",
        )

    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    channel = await service.create(user, payload.channel, payload.address)
    return NotificationChannelResponse.model_validate(channel)


@router.get("/{user_id}/channels", response_model=list[NotificationChannelResponse])
@require_auth
async def list_channels(
    user_id: int,
    current_user: User,
    service: NotificationChannelService = Depends(get_notification_channel_service),
    user_service: UserService = Depends(get_user_service),
) -> list[NotificationChannelResponse]:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    user = await user_service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    channels = await service.list_for_user(user)
    return [NotificationChannelResponse.model_validate(channel) for channel in channels]
