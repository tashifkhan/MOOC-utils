# NPTEL Assignment Solver - Architecture

A modular Chrome extension for solving NPTEL assignments with AI-powered hints using dependency injection.

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
│   ├── platform/                  # Chrome API adapters (injectable)
│   │   ├── chrome-runtime.js      # chrome.runtime adapter
│   │   ├── chrome-storage.js      # chrome.storage adapter
│   │   ├── chrome-tabs.js         # chrome.tabs adapter
│   │   └── chrome-scripting.js    # chrome.scripting adapter
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
├── content.js                     # Content script (no ES modules)
├── manifest.json                  # Extension manifest
├── sidepanel.html                 # UI template
├── styles.css                     # Styling
└── icons/                         # Extension icons
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
import { createStorageAdapter } from "../platform/chrome-storage.js";
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
- **platform/**: Chrome API adapters (no business logic)
- **services/**: Business logic independent of Chrome APIs
- **background/**: Message routing and handlers
- **ui/**: Presentation layer and controllers

### 2. **Explicit Dependencies**
All dependencies are passed as function parameters, making them:
- **Testable**: Easy to mock dependencies
- **Clear**: Dependencies are visible in function signatures
- **Flexible**: Can swap implementations without changing code

### 3. **No Global State**
Each factory returns a self-contained object with its own state. No global variables or singletons.

### 4. **Chrome API Isolation**
Platform adapters wrap Chrome APIs, so:
- Services don't directly call `chrome.*`
- Easy to create mock adapters for testing
- Future support for other browsers possible

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

### Content Script (No ES Modules)
Uses internal factory functions instead of imports:
```javascript
function createLogger(prefix) { /* ... */ }
function createExtractor(logger) { /* ... */ }
```

## Running the Extension

1. Load in Chrome: `chrome://extensions` → Load unpacked → Select this directory
2. Navigate to an NPTEL assignment page
3. Click the extension icon
4. Set your Gemini API key in settings
5. Click "Solve Assignment"

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
| `src/platform/chrome-*.js` | Chrome API adapters |
| `src/services/gemini/schema.js` | Gemini API response schema |
| `src/background/index.js` | Background DI container and initialization |
| `src/ui/index.js` | Side panel DI container and initialization |
| `content.js` | Content script (no modules due to Chrome limitations) |
| `manifest.json` | Extension manifest with ES module support |

## Benefits of This Architecture

✅ **Modular**: Each file has a single responsibility  
✅ **Testable**: Easy to mock dependencies  
✅ **Maintainable**: Clear separation of concerns  
✅ **Scalable**: Easy to add new features  
✅ **Type-safe**: JSDoc type hints for IDE support  
✅ **No build step**: Uses native ES modules  
✅ **Dependency injection**: Explicit, flexible, and testable  

## Migration from Old Code

- `background.js` → `src/background/` (split into router, handlers, services)
- `sidepanel.js` → `src/ui/controllers/solve.js` + `src/ui/index.js`
- `gemini.js` → `src/services/gemini/`
- `storage.js` → `src/services/storage/`
- `content.js` → refactored with internal factories (no ES modules)
