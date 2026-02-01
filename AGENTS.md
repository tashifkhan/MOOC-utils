# AGENTS.md - Guidelines for AI Coding Agents

This document provides guidelines for AI agents working in the MOOC-utils repository.

## Repository Overview

MOOC-utils contains utilities for online course platforms (NPTEL, Coursera, etc.):
- `assignment-solver/` - Chrome extension for assignment assistance (JavaScript)
- `notice-reminders/` - Notification utility (Python 3.12+)

---

## Build / Lint / Test Commands

### Chrome Extension (`assignment-solver/`)

```bash
# No build step required - vanilla JavaScript
# Load unpacked extension in Chrome:
# 1. Navigate to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select assignment-solver/

# Lint with ESLint (if configured)
npx eslint assignment-solver/**/*.js

# Format with Prettier (if configured)
npx prettier --write assignment-solver/**/*.js
```

### Python Project (`notice-reminders/`)

```bash
cd notice-reminders

# Install dependencies (uses uv or pip)
uv sync
# or: pip install -e .

# Run the application
python main.py
# or: uv run python main.py

# Lint with ruff
ruff check .

# Format with ruff
ruff format .

# Type check with pyright/mypy
pyright .
```

---

## Code Style Guidelines

### JavaScript (Chrome Extension)

#### Formatting
- Use tabs for indentation (not spaces)
- Use double quotes for strings
- Semicolons are optional but be consistent within files
- Max line length: 100 characters (soft limit)

#### Naming Conventions
- `camelCase` for variables and functions: `extractPageHTML`, `apiKey`
- `UPPER_SNAKE_CASE` for constants: `GEMINI_MODEL`, `EXTRACTION_SCHEMA`
- `PascalCase` for object namespaces: `Gemini`, `Storage`
- Prefix DOM element variables with context: `elements.statusBar`

#### File Organization
- Group related functionality into namespace objects (`Gemini`, `Storage`)
- Keep content scripts, background scripts, and UI logic separate
- Use descriptive comments at file top explaining purpose

#### Functions
```javascript
// Use async/await for Chrome APIs and fetch
async function loadApiKey() {
    const result = await chrome.storage.local.get("geminiApiKey");
    return result.geminiApiKey || null;
}

// Wrap Chrome message passing in Promises
async function extractPageHTML() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "EXTRACT_HTML" }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}
```

#### Error Handling
```javascript
// Always catch and log errors with context prefix
try {
    const result = await someAsyncOperation();
} catch (error) {
    console.error("[ModuleName] Operation failed:", error);
    // Re-throw or handle gracefully
}

// Use console prefixes for debugging: [NPTEL Solver], [Background], [Gemini]
console.log("[Background] Message received:", message.type);
```

#### Chrome Extension Patterns
- Use `chrome.runtime.onMessage` with `return true` for async responses
- Always check `chrome.runtime.lastError` in callbacks
- Use message types as constants: `"EXTRACT_HTML"`, `"APPLY_ANSWERS"`

### Python

#### Formatting
- Follow PEP 8
- Use 4 spaces for indentation
- Max line length: 88 characters (Black/Ruff default)
- Use double quotes for strings

#### Naming Conventions
- `snake_case` for functions and variables
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants
- Prefix private functions with underscore: `_helper_function`

#### Type Hints
```python
def process_data(items: list[str], count: int = 10) -> dict[str, int]:
    """Process items and return counts."""
    return {item: len(item) for item in items[:count]}
```

#### Imports
```python
# Standard library first
import os
from pathlib import Path

# Third-party packages
import requests

# Local imports
from .utils import helper
```

---

## Project-Specific Patterns

### Chrome Extension Architecture

```
sidepanel.js  ──────►  background.js  ──────►  content.js
    (UI)           (message router)        (DOM interaction)
      │                   │
      │                   ▼
      │              Gemini API
      ▼
  storage.js
```

#### Message Flow
1. Side panel initiates action via `chrome.runtime.sendMessage`
2. Background script routes to content script or Gemini API
3. Content script interacts with page DOM
4. Responses flow back through the chain

#### Key Files
- `content.js` - Page extraction and answer application
- `sidepanel.js` - UI controller and state management
- `background.js` - Service worker, API calls, screenshot capture
- `gemini.js` - Gemini API integration and schemas
- `storage.js` - Chrome storage utilities

### Gemini API Integration

```javascript
// Use structured output with JSON schema
const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SCHEMA_OBJECT,
        temperature: 0.1,
    },
};
```

### DOM Selectors (NPTEL-specific)

```javascript
// Question containers
".qt-mc-question", ".gcb-assessment-item"

// Input types
'input[type="radio"]'     // single_choice
'input[type="checkbox"]'  // multi_choice
'input[type="text"]'      // fill_blank

// Submit buttons
"#submitbutton", 'button[type="submit"]'
```

---

## Common Tasks

### Adding a New Message Type
1. Define handler in `background.js` `onMessage` listener
2. Add content script handler in `content.js` if needed
3. Create caller function in `sidepanel.js`

### Modifying Gemini Schema
1. Update schema in `gemini.js`
2. Update system prompt to match schema changes
3. Update response parsing in `parseResponse`

### Adding UI Elements
1. Add HTML in `sidepanel.html`
2. Register element in `initElements()` in `sidepanel.js`
3. Add event listener in `initEventListeners()`

---

## Testing Notes

- Test on actual NPTEL assignment pages
- Check Chrome DevTools console for `[NPTEL Solver]` prefixed logs
- Verify message passing between all three contexts
- Test with/without images on the page

---

## Dependencies

### Chrome Extension
- No npm dependencies - vanilla JavaScript
- Chrome Extension Manifest V3 APIs
- Gemini API (requires API key)

### Python (notice-reminders)
- Python >= 3.12
- No external dependencies (currently)

---

## Security Considerations

- API keys stored in `chrome.storage.local` (client-side only)
- Never log API keys or sensitive data
- Validate all data from content scripts before use
- Use `<all_urls>` permission only when necessary
