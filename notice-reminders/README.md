# MOOC Notice Reminders

A tool to track NPTEL/Swayam course announcements and send notifications.

## Architecture

The project is structured as a monorepo with a shared core and two interfaces:

- `app/`: Shared business logic, data models, and services.
- `package/cli/`: Interactive command-line interface.
- `package/api/`: FastAPI backend with database storage.

## Features

- **Search Courses**: Search for courses on Swayam by keyword.
- **View Announcements**: Fetch and display announcements for selected courses.
- **API Server**: REST API for managing subscriptions and users (requires DB).
- **Notifications**: (Planned) Telegram and Email support.

## Installation

Requires Python 3.12+.

```bash
cd notice-reminders
uv sync  # Install dependencies
```

## Usage

You can run the application in either CLI or API mode using the single entry point `main.py`.

### CLI Mode
Run the interactive scraper directly (no database required):

```bash
uv run python main.py cli
```

### API Mode
Run the backend server (requires database):

```bash
uv run python main.py api --reload
```
or
```bash
uv run python main.py api --host 0.0.0.0 --port 8000
```

## Development

- **Format**: `uv run ruff format .`
- **Lint**: `uv run ruff check .`
- **Type Check**: `uv run pyright .`
