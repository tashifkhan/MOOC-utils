# AGENTS.md - Guidelines for AI Coding Agents

## Context
MOOC-utils provides tools for online course platforms:
- `assignment-solver/`: Chrome extension for assignment assistance (Vanilla JS).
- `notice-reminders/`: Course search & notification CLI (Python 3.12+).

## Build & Test Commands

### Chrome Extension (`assignment-solver/`)
**Setup**: Load `assignment-solver/` directory as an unpacked extension in `chrome://extensions`.
**Lint/Format**:
```bash
npx eslint assignment-solver/**/*.js
npx prettier --write assignment-solver/**/*.js
```

### Python Project (`notice-reminders/`)
**Setup**:
```bash
cd notice-reminders
uv sync  # Install dependencies (httpx, beautifulsoup4)
```

**Run**:
```bash
uv run python main.py
```

**Lint & Format**:
```bash
ruff check .   # Lint
ruff format .  # Format
pyright .      # Type check
```

## Code Style & Conventions

### JavaScript (Chrome Extension)
- **Format**: Tabs for indentation, double quotes, optional semicolons (be consistent).
- **Naming**: `camelCase` (vars/funcs), `PascalCase` (classes/namespaces), `UPPER_CASE` (constants).
- **Async**: Use `async/await` for Chrome APIs. Wrap `chrome.runtime.sendMessage` in Promises.
- **Logging**: Prefix logs with context: `console.log("[Background]", msg)`.
- **Architecture**:
    - `sidepanel.js` (UI) ↔ `background.js` (Router) ↔ `content.js` (DOM).
    - Use `chrome.storage.local` for state.

### Python (notice-reminders)
- **Format**: PEP 8, 4 spaces indent, double quotes (use `ruff` defaults).
- **Naming**: `snake_case` (vars/funcs), `PascalCase` (classes), `UPPER_CASE` (constants).
- **Typing**: Use standard type hints (`list[str]`, `dict[str, Any]`, `Optional[int]`).
- **Imports**: Standard lib -> Third party -> Local.
  ```python
  import asyncio
  import httpx
  from models import Course
  ```
- **Error Handling**: Use `try/except` blocks specific to operations (e.g., `httpx.RequestError`).
- **Dependencies**: Manage via `uv`. Core libs: `httpx` (async requests), `beautifulsoup4` (parsing).

## Architecture Notes

### Chrome Extension
- **Message Passing**: UI -> Background -> Content -> Background -> UI.
- **Gemini**: Use structured JSON schema for API responses.
- **DOM**: Use specific selectors for NPTEL (`.qt-mc-question`, `.gcb-assessment-item`).

### Python Scraper
- **Client**: `SwayamClient` class uses `httpx.AsyncClient`.
- **Parsing**: `BeautifulSoup` for HTML. Handle dynamic dates (embedded JS) by parsing or fallback text.
- **Models**: Use `dataclasses` for structured data (`Course`, `Announcement`).
- **CLI**: Interactive loop in `main.py`, separation of concerns between logic (`swayam_client.py`) and UI.

## Development Workflow
1. **Analyze**: Check existing file structure and patterns before creating new files.
2. **Plan**: Propose changes and verify with `grep`/`read` if unsure of context.
3. **Implement**: Write code adhering to the styles above. Use `uv` for Python env management.
4. **Verify**: Run manual checks (`main.py`) before finishing.
