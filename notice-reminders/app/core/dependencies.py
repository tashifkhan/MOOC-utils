from functools import lru_cache

from fastapi import Depends

from app.core.config import Settings
from app.services.announcement_service import AnnouncementService
from app.services.course_service import CourseService
from app.services.notification_channel_service import NotificationChannelService
from app.services.notification_service import NotificationService
from app.services.subscription_service import SubscriptionService
from app.services.swayam_service import SwayamService
from app.services.user_service import UserService


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_swayam_service(
    settings: Settings = Depends(get_settings),
) -> SwayamService:
    return SwayamService(settings)


def get_course_service(
    settings: Settings = Depends(get_settings),
    client: SwayamService = Depends(get_swayam_service),
) -> CourseService:
    return CourseService(
        settings=settings,
        swayam_service=client,
    )


def get_announcement_service(
    settings: Settings = Depends(get_settings),
    client: SwayamService = Depends(get_swayam_service),
) -> AnnouncementService:
    return AnnouncementService(
        settings=settings,
        swayam_service=client,
    )


def get_user_service() -> UserService:
    return UserService()


def get_subscription_service() -> SubscriptionService:
    return SubscriptionService()


def get_notification_service() -> NotificationService:
    return NotificationService()


def get_notification_channel_service() -> NotificationChannelService:
    return NotificationChannelService()
