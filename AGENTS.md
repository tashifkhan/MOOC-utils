# AGENTS.md - Guidelines for AI Coding Agents

## Context
MOOC-utils provides tools for online course platforms:
- `assignment-solver/`: Chrome/Firefox extension for assignment assistance (Vanilla JS + Vite).
- `notice-reminders/`: Course search & notification CLI (Python 3.12+).

## Build, Test & Lint Commands

### Browser Extension (`assignment-solver/`)
**Package Manager**: Use `bun` (not npm).

**Setup**:
```bash
cd assignment-solver
bun install
```

**Build** (generates `dist/chrome/` and `dist/firefox/`):
```bash
bun run build           # Build both Chrome and Firefox
bun run build:chrome    # Build Chrome only
bun run build:firefox   # Build Firefox only
```

**Development** (watch mode):
```bash
bun run dev:chrome      # Watch and rebuild for Chrome
bun run dev:firefox     # Watch and rebuild for Firefox
```

**Lint & Format**:
```bash
bun run lint            # Run ESLint
bun run format          # Run Prettier
```

**Load Extension**:
- Chrome: Load `dist/chrome/` as unpacked extension in `chrome://extensions`
- Firefox: Load `dist/firefox/` via `about:debugging`

### Python Project (`notice-reminders/`)
**Setup**:
```bash
cd notice-reminders
uv sync                 # Install dependencies (httpx, beautifulsoup4)
```

**Run**:
```bash
uv run python main.py
```

**Lint & Format**:
```bash
ruff check .            # Lint all files
ruff check main.py      # Lint single file
ruff format .           # Format all files
pyright .               # Type check
```

## Code Style & Conventions

### JavaScript (Browser Extension)
- **Format**: Tabs for indentation, double quotes, optional semicolons (be consistent).
- **Naming**: `camelCase` (vars/funcs), `PascalCase` (classes/namespaces), `UPPER_CASE` (constants).
- **Async**: Use `async/await` for browser APIs. Use `webextension-polyfill` for cross-browser compatibility.
- **Logging**: Prefix logs with context: `console.log("[Background]", msg)`.
- **Imports**: Group by external -> internal -> relative. Use `.js` extensions in imports.
- **JSDoc**: Document all exported functions with JSDoc comments including params and returns.

**Dependency Injection Pattern**:
```javascript
// Factory function pattern - all services use this
export function createServiceName({ dep1, dep2, logger = null }) {
    const log = logger?.log || (() => {});
    return { method() { /* use deps */ } };
}
```
- **Architecture**:
    - `src/ui/` (UI) ↔ `src/background/` (Router) ↔ `src/content/` (DOM).
    - Use `browser.storage.local` (via polyfill) for state.
    - Modular structure with dependency injection via factory functions.

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
- **Dependency Injection**: All services created via factory functions in composition roots:
  - `src/background/index.js` - Background service worker
  - `src/ui/index.js` - Side panel UI
  - `src/content/index.js` - Content script
- **Gemini**: Use structured JSON schema for API responses.
- **DOM**: Use specific selectors for NPTEL (`.qt-mc-question`, `.gcb-assessment-item`).
- **Build System**: Vite with custom manifest generation for Chrome/Firefox targets.
- **Cross-Browser**: Uses `webextension-polyfill` for unified API across Chrome and Firefox.

### Python Scraper
- **Client**: `SwayamClient` class uses `httpx.AsyncClient`.
- **Parsing**: `BeautifulSoup` for HTML. Handle dynamic dates (embedded JS) by parsing or fallback text.
- **Models**: Use `dataclasses` for structured data (`Course`, `Announcement`).
- **CLI**: Interactive loop in `main.py`, separation of concerns between logic (`swayam_client.py`) and UI.

## Development Workflow
1. **Analyze**: Check existing file structure and patterns before creating new files.
2. **Plan**: Propose changes and verify with `grep`/`read` if unsure of context.
3. **Implement**: Write code adhering to the styles above. Use `uv` for Python env management.
4. **Verify**: Run lint and build commands before finishing. Never commit unless explicitly asked.
