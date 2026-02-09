from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_notification_channel_service, get_user_service
from app.schemas.notification_channel import (
    NotificationChannelCreate,
    NotificationChannelResponse,
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.notification_channel_service import NotificationChannelService
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    if payload.notify_telegram and not payload.telegram_id:
        raise HTTPException(
            status_code=400,
            detail="telegram_id required when notify_telegram is true",
        )

    if payload.notify_email and not payload.notification_email:
        payload.notification_email = payload.email

    user = await service.create_user(payload)
    return UserResponse.model_validate(user)


@router.get("", response_model=list[UserResponse])
async def list_users(
    service: UserService = Depends(get_user_service),
) -> list[UserResponse]:
    users = await service.list_users()
    return [UserResponse.model_validate(user) for user in users]


@router.get("/by-email", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    user = await service.get_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    user = await service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    updated = await service.update_user(user, payload)
    return UserResponse.model_validate(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
) -> None:
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
async def add_channel(
    user_id: int,
    payload: NotificationChannelCreate,
    service: NotificationChannelService = Depends(get_notification_channel_service),
    user_service: UserService = Depends(get_user_service),
) -> NotificationChannelResponse:
    if payload.user_id != user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID mismatch",
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
async def list_channels(
    user_id: int,
    service: NotificationChannelService = Depends(get_notification_channel_service),
    user_service: UserService = Depends(get_user_service),
) -> list[NotificationChannelResponse]:
    user = await user_service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    channels = await service.list_for_user(user)
    return [NotificationChannelResponse.model_validate(channel) for channel in channels]
