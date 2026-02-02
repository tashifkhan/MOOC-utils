# NPTEL Assignment Solver - Architecture

A modular browser extension for solving NPTEL assignments with AI-powered hints using dependency injection. Supports both Chrome and Firefox.

## Architecture Overview

### Directory Structure

```
assignment-solver/
├── src/
│   ├── core/                      # Core utilities & type definitions
│   │   ├── types.js               # JSDoc type definitions
│   │   ├── logger.js              # Logger factory
│   │   └── messages.js            # Message type constants
│   │
│   ├── platform/                  # Browser API adapters (cross-browser)
│   │   ├── browser.js             # webextension-polyfill wrapper
│   │   ├── panel.js               # Side panel/sidebar abstraction
│   │   ├── runtime.js             # browser.runtime adapter
│   │   ├── storage.js             # browser.storage adapter
│   │   ├── tabs.js                # browser.tabs adapter
│   │   └── scripting.js           # browser.scripting adapter
│   │
│   ├── services/                  # Business logic layer
│   │   ├── storage/
│   │   │   └── index.js           # Storage service factory
│   │   └── gemini/
│   │       ├── index.js           # Gemini service factory
│   │       ├── schema.js          # API schema definition
│   │       └── parser.js          # Response parsing
│   │
│   ├── background/                # Background service worker
│   │   ├── index.js               # Entry point with DI setup
│   │   ├── router.js              # Message router factory
│   │   ├── screenshot.js          # Screenshot service factory
│   │   └── handlers/
│   │       ├── extraction.js      # EXTRACT_HTML handler
│   │       ├── gemini.js          # GEMINI_REQUEST handler
│   │       ├── screenshot.js      # CAPTURE_FULL_PAGE handler
│   │       └── answers.js         # APPLY_ANSWERS, SUBMIT handler
│   │
│   ├── content/                   # Content script (modular)
│   │   ├── index.js               # Entry point
│   │   ├── logger.js              # Logger factory
│   │   ├── extractor.js           # HTML extraction logic
│   │   └── applicator.js          # Answer application logic
│   │
│   └── ui/                        # Side panel UI
│       ├── index.js               # Entry point with DI setup
│       ├── elements.js            # DOM element bindings
│       ├── state.js               # State manager factory
│       ├── utils.js               # UI utilities
│       └── controllers/
│           ├── solve.js           # Main solve flow controller
│           ├── settings.js        # Settings modal controller
│           └── progress.js        # Progress display controller
│
├── public/                        # Static assets
│   ├── sidepanel.html             # UI template
│   ├── styles.css                 # Styling
│   └── icons/                     # Extension icons
│
├── dist/                          # Build output
│   ├── chrome/                    # Chrome build
│   └── firefox/                   # Firefox build
│
├── manifest.config.js             # Dynamic manifest generation
├── vite.config.js                 # Vite build configuration
└── package.json                   # Dependencies (use bun)
```

## Dependency Injection Pattern

All modules use **factory functions** for dependency injection, making the code testable and modular.

### Example: Storage Service

```javascript
// src/services/storage/index.js
export function createStorageService({ storage, logger = null }) {
  const log = logger?.log || (() => {});

  return {
    async saveApiKey(key) {
      log("Saving API key");
      return storage.set({ geminiApiKey: key });
    },
    // ... more methods
  };
}
```

### Dependency Injection at Startup

```javascript
// src/ui/index.js - Example wiring
import { createStorageAdapter } from "../platform/storage.js";
import { createStorageService } from "../services/storage/index.js";

const storageAdapter = createStorageAdapter();
const storageService = createStorageService({ 
  storage: storageAdapter,
  logger 
});
```

## Key Design Principles

### 1. **Separation of Concerns**
- **core/**: Pure utilities and type definitions
- **platform/**: Browser API adapters (no business logic)
- **services/**: Business logic independent of browser APIs
- **background/**: Message routing and handlers
- **ui/**: Presentation layer and controllers
- **content/**: DOM interaction (page context)

### 2. **Explicit Dependencies**
All dependencies are passed as function parameters, making them:
- **Testable**: Easy to mock dependencies
- **Clear**: Dependencies are visible in function signatures
- **Flexible**: Can swap implementations without changing code

### 3. **No Global State**
Each factory returns a self-contained object with its own state. No global variables or singletons.

### 4. **Cross-Browser API Isolation**
Platform adapters use `webextension-polyfill`:
- Services don't directly call `chrome.*` or `browser.*`
- Easy to create mock adapters for testing
- Unified API across Chrome and Firefox

## Message Flow

### 1. Side Panel → Background → Content Script

```
User clicks "Solve" 
  ↓
SolveController.handleSolve()
  ↓
runtime.sendMessage({ type: "EXTRACT_HTML" })
  ↓
Background receives message
  ↓
ExtractionHandler calls TabsAdapter.sendMessage()
  ↓
Content script receives message
  ↓
Extractor.extractPageHTML()
  ↓
Returns page data
```

### 2. Background ↔ Gemini API

```
Background receives GEMINI_REQUEST
  ↓
GeminiHandler calls GeminiService.directAPICall()
  ↓
Fetch to Gemini API endpoint
  ↓
Parse response with Parser
  ↓
Return to side panel
```

## Build System

### Vite Configuration
- **Bundler**: Vite for fast builds and ES modules support
- **Polyfill**: webextension-polyfill for cross-browser compatibility
- **Dynamic Manifests**: Separate manifests for Chrome and Firefox

### Build Commands (use bun, not npm)

```bash
# Install dependencies
bun install

# Build for both browsers
bun run build

# Build for specific browser
bun run build:chrome
bun run build:firefox

# Watch mode (development)
bun run dev:chrome
bun run dev:firefox
```

### Browser Differences

**Chrome:**
- Uses `sidePanel` API
- Manifest includes `"side_panel"` key
- Background: `"service_worker"`

**Firefox:**
- Uses `sidebarAction` API
- Manifest includes `"sidebar_action"` key
- Background: `"scripts"` array
- Includes `browser_specific_settings.gecko.id`

## File Import Structure

### Background (ES Modules)
```javascript
import { createLogger } from "../core/logger.js";
import { createGeminiService } from "../services/gemini/index.js";
```

### Side Panel (ES Modules)
```javascript
import { createStorageService } from "../services/storage/index.js";
import { createSolveController } from "./controllers/solve.js";
```

### Content Script (ES Modules - bundled by Vite)
```javascript
import { browser } from "../platform/browser.js";
import { createExtractor } from "./extractor.js";
import { createApplicator } from "./applicator.js";
```

## Running the Extension

### Chrome
1. Build: `bun run build:chrome`
2. Load in Chrome: `chrome://extensions` → Load unpacked → Select `dist/chrome/`
3. Navigate to an NPTEL assignment page
4. Click the extension icon
5. Set your Gemini API key in settings
6. Click "Solve Assignment"

### Firefox
1. Build: `bun run build:firefox`
2. Load in Firefox: `about:debugging` → Load Temporary Add-on → Select `dist/firefox/manifest.json`
3. Navigate to an NPTEL assignment page
4. Click the extension icon
5. Set your Gemini API key in settings
6. Click "Solve Assignment"

## Development Workflow

### Adding a New Service

1. Create `src/services/myservice/index.js`
2. Export a factory function: `export function createMyService({ deps }) { ... }`
3. Import in the appropriate entry point (`src/background/index.js` or `src/ui/index.js`)
4. Wire up dependencies in the entry point

### Adding a New Handler

1. Create `src/background/handlers/myhandler.js`
2. Export handler factory: `export function createMyHandler({ deps }) { ... }`
3. Add to handlers object in `src/background/index.js`
4. Add message type to `src/core/messages.js`

### Testing a Service

```javascript
// Example: Test storage service with mock adapter
const mockStorage = {
  set: async (data) => ({ success: true }),
  get: async (key) => ({ key: "test" }),
};

const service = createStorageService({ storage: mockStorage });
await service.saveApiKey("test-key");
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/core/types.js` | JSDoc type definitions for IDE autocomplete |
| `src/core/logger.js` | Logger factory with context prefixes |
| `src/core/messages.js` | Message type constants and helpers |
| `src/platform/browser.js` | webextension-polyfill wrapper |
| `src/platform/panel.js` | Cross-browser panel abstraction |
| `src/services/gemini/schema.js` | Gemini API response schema |
| `src/background/index.js` | Background DI container and initialization |
| `src/ui/index.js` | Side panel DI container and initialization |
| `src/content/index.js` | Content script entry point |
| `manifest.config.js` | Dynamic manifest generation |
| `vite.config.js` | Vite build configuration |

## Benefits of This Architecture

✅ **Modular**: Each file has a single responsibility  
✅ **Testable**: Easy to mock dependencies  
✅ **Maintainable**: Clear separation of concerns  
✅ **Scalable**: Easy to add new features  
✅ **Type-safe**: JSDoc type hints for IDE support  
✅ **Cross-browser**: Works on Chrome and Firefox  
✅ **Modern build**: Vite with hot reload  
✅ **Dependency injection**: Explicit, flexible, and testable  

## Migration from Old Code

- `background.js` → `src/background/` (split into router, handlers, services)
- `sidepanel.js` → `src/ui/controllers/solve.js` + `src/ui/index.js`
- `gemini.js` → `src/services/gemini/`
- `storage.js` → `src/services/storage/`
- `content.js` → `src/content/` (modularized with ES modules)
- `manifest.json` → `manifest.config.js` (dynamic generation)
- `package.json` → uses **bun** instead of npm
