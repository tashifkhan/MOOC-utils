"""Root entry point for notice-reminders - choose between CLI and API modes."""

import argparse
import asyncio
import sys


def main():
    parser = argparse.ArgumentParser(
        description="MOOC Notice Reminders - Search courses and get announcements",
        prog="notice-reminders",
    )

    subparsers = parser.add_subparsers(
        dest="mode",
        help="Mode to run",
    )

    # CLI mode
    cli_parser = subparsers.add_parser(
        "cli",
        help="Run interactive CLI mode",
    )

    # API mode
    api_parser = subparsers.add_parser(
        "api",
        help="Run FastAPI server",
    )
    api_parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)",
    )
    api_parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind to (default: 8000)",
    )
    api_parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload for development",
    )

    args = parser.parse_args()

    if args.mode == "cli":
        from app.cli import cli_main

        asyncio.run(cli_main())

    elif args.mode == "api":
        import uvicorn

        uvicorn.run(
            "app.api.main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
        )

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
