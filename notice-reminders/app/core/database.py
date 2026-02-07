from pathlib import Path
from typing import Any

from tortoise.contrib.fastapi import register_tortoise


def get_tortoise_config(database_url: str) -> dict[str, Any]:
    return {
        "connections": {"default": database_url},
        "apps": {
            "models": {
                "models": [
                    "app.models.user",
                    "app.models.course",
                    "app.models.announcement",
                    "app.models.subscription",
                    "app.models.notification",
                    "app.models.notification_channel",
                ],
                "default_connection": "default",
            }
        },
    }


def _get_sqlite_path(database_url: str) -> Path | None:
    if not database_url.startswith("sqlite://"):
        return None

    path_part = database_url.removeprefix("sqlite://")
    if not path_part or path_part == ":memory:":
        return None

    return Path(path_part)


def register_database(app, database_url: str, generate_schemas: bool) -> None:
    config = get_tortoise_config(database_url)
    sqlite_path = _get_sqlite_path(database_url)
    should_generate = generate_schemas

    if sqlite_path is not None and not sqlite_path.exists():
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)
        should_generate = True

    register_tortoise(
        app,
        config=config,
        generate_schemas=should_generate,
        add_exception_handlers=True,
    )
