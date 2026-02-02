# Developer Guide - NPTEL Assignment Solver

Quick reference for working with the modular, cross-browser codebase.

## Prerequisites

- [Bun](https://bun.sh/) package manager (not npm)
- Chrome (v116+) or Firefox (v121+)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Quick Start

```bash
# Install dependencies
bun install

# Build for both browsers
bun run build

# Or build individually
bun run build:chrome
bun run build:firefox
```

## Understanding the Codebase

### Layer 1: Core (Pure Utilities)
Files in `src/core/` are pure utilities with no browser API dependencies.

```javascript
// Logger - used everywhere for logging with context
import { createLogger } from "../core/logger.js";
const logger = createLogger("MyModule");
logger.log("This message will be prefixed with [MyModule]");
```

### Layer 2: Platform (Browser API Adapters)
Files in `src/platform/` wrap browser APIs using webextension-polyfill, making them injectable and cross-browser compatible.

```javascript
// Instead of directly calling chrome.storage.local.get()
import { createStorageAdapter } from "../platform/storage.js";
const adapter = createStorageAdapter();
const data = await adapter.get("key");
```

### Layer 3: Services (Business Logic)
Files in `src/services/` contain business logic and depend only on adapters.

```javascript
// GeminiService doesn't call browser APIs directly
// Instead, it uses an injected runtime adapter
import { createGeminiService } from "../services/gemini/index.js";
const service = createGeminiService({ runtime: adapter, logger });
```

### Layer 4: Background/UI (Application Logic)
Entry points (`src/background/index.js`, `src/ui/index.js`) wire up dependencies.

```javascript
// These entry points create all the adapters and services
// and set up message routing/UI handlers
```

### Layer 5: Content Script (DOM Interaction)
Files in `src/content/` handle page DOM interaction, bundled by Vite.

```javascript
// Content script uses ES modules (bundled by Vite)
import { createExtractor } from "./extractor.js";
import { browser } from "../platform/browser.js";
```

## Common Tasks

### Add a New Message Type

1. Add to `src/core/messages.js`:
```javascript
export const MESSAGE_TYPES = {
  // ... existing
  MY_NEW_MESSAGE: "MY_NEW_MESSAGE",
};
```

2. Create handler in `src/background/handlers/myhandler.js`:
```javascript
export function createMyHandler({ deps, logger }) {
  return async function handleMyMessage(message, sender, sendResponse) {
    // Handle message
    sendResponse({ result: "ok" });
  };
}
```

3. Add to handlers in `src/background/index.js`:
```javascript
const handlers = {
  // ... existing
  [MESSAGE_TYPES.MY_NEW_MESSAGE]: createMyHandler({ deps, logger }),
};
```

### Send a Message from Side Panel

All message sending happens through the runtime adapter:

```javascript
// In src/ui/controllers/solve.js
const response = await runtime.sendMessage({
  type: MESSAGE_TYPES.MY_NEW_MESSAGE,
  payload: { data: "test" },
});
```

### Extend a Service

To add a method to an existing service:

1. Locate the service factory (e.g., `src/services/storage/index.js`)
2. Add your method:
```javascript
export function createStorageService({ storage, logger }) {
  return {
    // ... existing methods
    async myNewMethod(param) {
      logger?.log("Doing something");
      return await storage.doSomething(param);
    },
  };
}
```

3. Use the service in a controller or handler

### Test a Service

Create a simple test file:

```javascript
// test-storage.js
import { createStorageService } from "./src/services/storage/index.js";

// Mock adapter
const mockStorage = {
  set: async (data) => console.log("Mock set:", data),
  get: async (key) => ({ [key]: "test-value" }),
};

const service = createStorageService({ storage: mockStorage });
await service.saveApiKey("my-key");
console.log("✓ Test passed");
```

Run with: `bun test-storage.js`

### Handle Async Errors

All async operations should properly handle errors:

```javascript
export function createMyHandler({ deps, logger }) {
  return async function handle(message, sender, sendResponse) {
    try {
      const result = await someAsyncOperation();
      sendResponse({ success: true, data: result });
    } catch (error) {
      logger?.error(`Operation failed: ${error.message}`);
      sendResponse({ error: error.message });
    }
  };
}
```

## Build Commands

```bash
# Development (watch mode)
bun run dev:chrome      # Watch and rebuild for Chrome
bun run dev:firefox     # Watch and rebuild for Firefox

# Production builds
bun run build           # Build both Chrome and Firefox
bun run build:chrome    # Build Chrome only
bun run build:firefox   # Build Firefox only

# Lint and format
bun run lint            # Run ESLint
bun run format          # Run Prettier
```

## Loading the Extension

### Chrome
1. Build: `bun run build:chrome`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `dist/chrome/` folder

### Firefox
1. Build: `bun run build:firefox`
2. Open `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `dist/firefox/manifest.json`

## Debugging Tips

### View Logs

1. **Background worker logs**: 
   - Open `chrome://extensions/` (Chrome) or `about:debugging` (Firefox)
   - Find this extension
   - Click "Inspect" or "background service worker" link

2. **Content script logs**:
   - Open DevTools (F12) on an NPTEL assignment page
   - All logs from content script appear there

3. **Side panel logs**:
   - Right-click side panel → Inspect
   - Logs appear in DevTools console

### Check Message Flow

Messages are prefixed with context, making it easy to trace:
- `[Background]` - Background worker logs
- `[SidePanel]` - Side panel logs
- `[Content]` - Content script logs
- `[Extractor]` - HTML extraction logs
- `[Applicator]` - Answer application logs

### Add Debug Logging

Temporarily add logging anywhere:

```javascript
// In any factory
const log = logger?.log || (() => {});
log("Debug info here");
```

### Verify Manifest is Loaded

In any script console:
```javascript
browser.runtime.getManifest()
// Should show manifest with background.type = "module"
```

### Check Browser Detection

```javascript
import { detectBrowser, isChrome, isFirefox } from "./src/platform/browser.js";
console.log("Browser:", detectBrowser()); // "chrome" or "firefox"
console.log("Is Chrome:", isChrome());
console.log("Is Firefox:", isFirefox());
```

## Common Patterns

### Pattern 1: Factory with Dependencies

```javascript
export function createMyService({ storage, runtime, logger }) {
  const log = logger?.log || (() => {});
  
  return {
    async doSomething() {
      log("Starting operation");
      const data = await storage.get("key");
      const response = await runtime.sendMessage({ type: "GET_DATA" });
      return { data, response };
    },
  };
}
```

### Pattern 2: Handler with Async Response

```javascript
export function createMyHandler({ service, logger }) {
  return async function handle(message, sender, sendResponse) {
    try {
      const result = await service.doSomething();
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  };
}
```

### Pattern 3: Controller with State

```javascript
export function createMyController({ elements, state, service }) {
  return {
    async handleClick() {
      if (state.isProcessing()) return;
      state.setProcessing(true);
      
      try {
        const result = await service.doSomething();
        elements.resultDiv.textContent = result;
      } finally {
        state.setProcessing(false);
      }
    },
  };
}
```

## File Naming Conventions

- **Factories**: No special prefix, just descriptive name
  - `createStorageService`, `createLogger`, `createMyHandler`
- **Services**: Named with "Service" suffix
  - `createGeminiService`, `createScreenshotService`
- **Controllers**: Named with "Controller" suffix
  - `createSolveController`, `createSettingsController`
- **Adapters**: Named with "Adapter" suffix
  - `createStorageAdapter`, `createRuntimeAdapter`
- **Handlers**: Named with "Handler" suffix
  - `createExtractionHandler`, `createGeminiHandler`

## Import Path Conventions

Keep imports relative and clear:

```javascript
// In src/ui/index.js
import { createLogger } from "../core/logger.js";           // Up to root, then into core
import { createStorageAdapter } from "../platform/storage.js"; // Up to root, then into platform
import { createStorageService } from "../services/storage/index.js";   // Up to root, then into services
```

## Cross-Browser Considerations

### Chrome vs Firefox Differences

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Panel API | `browser.sidePanel` | `browser.sidebarAction` |
| Background | `service_worker` | `scripts` array |
| Manifest Key | `side_panel` | `sidebar_action` |
| Add-on ID | Not required | Required in `browser_specific_settings` |

### Testing Cross-Browser

Always test changes on both browsers:
1. Build for both: `bun run build`
2. Load Chrome build in Chrome
3. Load Firefox build in Firefox
4. Verify functionality works identically

## Resources

- **Architecture**: See `ARCHITECTURE.md`
- **Data Flow**: See `DATA_FLOW.md`
- **Manifest**: See `manifest.config.js` (dynamic generation)
- **Build**: See `vite.config.js`
- **Types**: See `src/core/types.js` for JSDoc type definitions
- **Main README**: See `../README.md`

## Troubleshooting

### Build Errors

**Error: Cannot find module 'webextension-polyfill'**
```bash
bun install
```

**Error: Vite not found**
```bash
bun install
```

### Extension Not Loading

1. Check that build succeeded: `bun run build`
2. Verify `dist/chrome/` or `dist/firefox/` exists
3. Check manifest.json is valid JSON
4. Look for errors in browser console

### Messages Not Working

1. Check that content script is injected (look for `[Content]` logs)
2. Verify message types match in `src/core/messages.js`
3. Check background service worker is running
4. Look for errors in background console

### Panel Not Opening

1. Check browser-specific panel API is available
2. Verify manifest has correct panel configuration
3. Check for errors in background console
4. Try clicking extension icon again
