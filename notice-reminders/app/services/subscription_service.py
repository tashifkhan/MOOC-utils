from tortoise.exceptions import IntegrityError

from app.models.course import Course
from app.models.subscription import Subscription
from app.models.user import User


class SubscriptionService:
    async def subscribe(self, user: User, course: Course) -> Subscription:
        try:
            return await Subscription.create(user=user, course=course)
        except IntegrityError:
            return await Subscription.get(user=user, course=course)

    async def list_subscriptions(self) -> list[Subscription]:
        return await Subscription.all().order_by("-created_at")

    async def list_for_user(self, user: User) -> list[Subscription]:
        return await Subscription.filter(user=user).order_by("-created_at")

    async def delete(self, subscription: Subscription) -> None:
        await subscription.delete()
