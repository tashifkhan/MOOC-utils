# Notice Reminders

A CLI tool to search for MOOC courses on Swayam/NPTEL and fetch their latest announcements.

## Features

- **Search Courses**: Search for courses on Swayam by keyword.
- **View Announcements**: Fetch and display announcements for selected courses.
- **Interactive CLI**: Easy-to-use command line interface.

## Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) (recommended for dependency management)

## Installation

1. Navigate to the project directory:
   ```bash
   cd notice-reminders
   ```

2. Install dependencies using `uv`:
   ```bash
   uv sync
   ```

## Usage

Run the application:

```bash
uv run python main.py
```

### Interactive Flow

1. **Enter Search Query**: Type a keyword (e.g., "python", "data science") and press Enter.
2. **Select Course**: You will see a list of matching courses. Enter the number corresponding to the course you are interested in.
3. **View Announcements**: The application will fetch and display the latest announcements for the selected course.
4. **Quit**: Enter `q` at the search prompt to exit the application.

## Dependencies

- [httpx](https://www.python-httpx.org/) - For async HTTP requests
- [beautifulsoup4](https://www.crummy.com/software/BeautifulSoup/) - For HTML parsing
