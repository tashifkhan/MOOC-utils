from typing import Union, cast, final

from pydantic import EmailStr
from tortoise.exceptions import IntegrityError

from app.models.notification_channel import NotificationChannel
from app.models.user import User
from app.schemas.user import UserUpdate


@final
class UserService:
    async def list_users(self) -> list[User]:
        return await User.all().order_by("email")

    async def get_user(self, user_id: int) -> User | None:
        return await User.get_or_none(id=user_id)

    async def get_user_by_email(self, email: str) -> User | None:
        return await User.get_or_none(email=email)

    async def update_user(
        self,
        user: User,
        payload: UserUpdate,
    ) -> User:
        data = payload.model_dump(exclude_unset=True)

        for field, value in data.items():
            setattr(user, field, value)

        await user.save()
        return user

    async def delete_user(self, user: User) -> None:
        await user.delete()

    async def add_channel(
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
