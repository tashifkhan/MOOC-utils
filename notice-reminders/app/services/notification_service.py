from app.models.announcement import Announcement
from app.models.notification import Notification
from app.models.notification_channel import NotificationChannel
from app.models.subscription import Subscription


class NotificationService:
    async def create(
        self,
        subscription: Subscription,
        announcement: Announcement,
        channel: NotificationChannel | None,
    ) -> Notification:
        return await Notification.create(
            user=subscription.user,
            subscription=subscription,
            announcement=announcement,
            channel=channel,
        )

    async def list_notifications(self) -> list[Notification]:
        return await Notification.all().order_by("-sent_at")

    async def list_for_user(self, user_id: int) -> list[Notification]:
        return await Notification.filter(user_id=user_id).order_by("-sent_at")

    async def mark_read(self, notification: Notification) -> Notification:
        notification.is_read = True
        await notification.save()
        return notification
