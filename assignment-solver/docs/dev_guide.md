# Developer Guide - NPTEL Assignment Solver

Quick reference for working with the modular codebase.

## Understanding the Codebase

### Layer 1: Core (Pure Utilities)
Files in `src/core/` are pure utilities with no Chrome API dependencies.

```javascript
// Logger - used everywhere for logging with context
import { createLogger } from "../core/logger.js";
const logger = createLogger("MyModule");
logger.log("This message will be prefixed with [MyModule]");
```

### Layer 2: Platform (Chrome API Adapters)
Files in `src/platform/` wrap Chrome APIs, making them injectable.

```javascript
// Instead of directly calling chrome.storage.local.get()
import { createStorageAdapter } from "../platform/chrome-storage.js";
const adapter = createStorageAdapter();
const data = await adapter.get("key");
```

### Layer 3: Services (Business Logic)
Files in `src/services/` contain business logic and depend only on adapters.

```javascript
// GeminiService doesn't call chrome.runtime directly
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

Run with: `node test-storage.js`

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

## Debugging Tips

### View Logs

1. **Background worker logs**: 
   - Open `chrome://extensions/`
   - Find this extension
   - Click "background service worker" link or inspect

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
- `[NPTEL Solver]` - Content script logs

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
chrome.runtime.getManifest()
// Should show manifest with background.type = "module"
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
import { createStorageAdapter } from "../platform/chrome-storage.js"; // Up to root, then into platform
import { createStorageService } from "../services/storage/index.js";   // Up to root, then into services
```

## Resources

- **Architecture**: See `ARCHITECTURE.md`
- **Manifest**: See `manifest.json` (note: `"type": "module"` for ES modules)
- **Types**: See `src/core/types.js` for JSDoc type definitions
