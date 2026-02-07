from tortoise.exceptions import IntegrityError

from app.models.notification_channel import NotificationChannel
from app.models.user import User


class NotificationChannelService:
    async def list_for_user(self, user: User) -> list[NotificationChannel]:
        return await NotificationChannel.filter(user=user).order_by("-created_at")

    async def create(
        self,
        user: User,
        channel: str,
        address: str,
    ) -> NotificationChannel:
        try:
            return await NotificationChannel.create(
                user=user,
                channel=channel,
                address=address,
            )
        except IntegrityError:
            return await NotificationChannel.get(
                user=user, channel=channel, address=address
            )

    async def disable(self, channel: NotificationChannel) -> NotificationChannel:
        channel.is_active = False
        await channel.save()
        return channel
