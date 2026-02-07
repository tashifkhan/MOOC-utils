from fastapi import FastAPI

from app.core.config import Settings
from app.core.database import register_database
from app.api.routers import (
    announcements,
    courses,
    notifications,
    search,
    subscriptions,
    users,
)


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug)

    app.include_router(users.router)
    app.include_router(search.router)
    app.include_router(courses.router)
    app.include_router(announcements.router)
    app.include_router(subscriptions.router)
    app.include_router(notifications.router)

    register_database(
        app,
        settings.database_url,
        generate_schemas=settings.debug,
    )
    return app


app = create_app()
