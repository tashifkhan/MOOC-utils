/**
 * @fileoverview Background service worker entry point with DI setup
 */

import { createLogger } from "../core/logger.js";
import { MESSAGE_TYPES } from "../core/messages.js";
import { browser } from "../platform/browser.js";
import { createRuntimeAdapter } from "../platform/runtime.js";
import { createTabsAdapter } from "../platform/tabs.js";
import { createScriptingAdapter } from "../platform/scripting.js";
import { createPanelAdapter } from "../platform/panel.js";
import { createGeminiService } from "../services/gemini/index.js";
import { createScreenshotService } from "./screenshot.js";
import { createExtractionHandler } from "./handlers/extraction.js";
import { createScreenshotHandler } from "./handlers/screenshot.js";
import { createGeminiHandler } from "./handlers/gemini.js";
import { createAnswerHandler } from "./handlers/answers.js";
import { createPageInfoHandler } from "./handlers/pageinfo.js";
import { createMessageRouter } from "./router.js";

// Initialize logger
const logger = createLogger("Background");

// Initialize platform adapters
const runtimeAdapter = createRuntimeAdapter();
const tabsAdapter = createTabsAdapter();
const scriptingAdapter = createScriptingAdapter();
const panelAdapter = createPanelAdapter({ logger });

logger.log("Initializing background service worker");

// Initialize services
const geminiService = createGeminiService({
  runtime: runtimeAdapter,
  logger,
});

const screenshotService = createScreenshotService({
  tabs: tabsAdapter,
  scripting: scriptingAdapter,
  logger,
});

// Create message handlers
const handlers = {
  // PING handler for health checks from UI
  [MESSAGE_TYPES.PING]: (message, sender, sendResponse) => {
    logger.log("Received PING from UI/sidebar");
    sendResponse({ pong: true, timestamp: Date.now() });
  },
  [MESSAGE_TYPES.EXTRACT_HTML]: createExtractionHandler({
    tabs: tabsAdapter,
    scripting: scriptingAdapter,
    logger,
  }),
  [MESSAGE_TYPES.GET_PAGE_INFO]: createPageInfoHandler({
    tabs: tabsAdapter,
    scripting: scriptingAdapter,
    logger,
  }),
  [MESSAGE_TYPES.CAPTURE_FULL_PAGE]: createScreenshotHandler({
    screenshotService,
    logger,
  }),
  [MESSAGE_TYPES.GEMINI_REQUEST]: createGeminiHandler({
    geminiService,
    logger,
  }),
  [MESSAGE_TYPES.GEMINI_DEBUG]: async (message, sender, sendResponse) => {
    const stage = message?.stage || "unknown";
    logger.log(`[Gemini][${stage}]`, message?.payload);

    // Side panel messages don't have sender.tab, so query the active tab
    let tabId = sender?.tab?.id;
    if (!tabId) {
      try {
        const tabs = await tabsAdapter.query({
          active: true,
          currentWindow: true,
        });
        tabId = tabs?.[0]?.id;
      } catch (err) {
        logger.log(`Could not find active tab: ${err.message}`);
      }
    }

    if (tabId) {
      tabsAdapter
        .sendMessage(tabId, {
          type: MESSAGE_TYPES.GEMINI_DEBUG,
          stage: stage,
          payload: message?.payload,
        })
        .catch((error) => {
          logger.log(`Gemini debug relay failed: ${error.message}`);
        });
    } else {
      logger.log("No tab ID available for debug relay");
    }

    sendResponse({ ok: true });
  },
  [MESSAGE_TYPES.APPLY_ANSWERS]: createAnswerHandler({
    tabs: tabsAdapter,
    scripting: scriptingAdapter,
    logger,
  }),
  [MESSAGE_TYPES.SUBMIT_ASSIGNMENT]: createAnswerHandler({
    tabs: tabsAdapter,
    scripting: scriptingAdapter,
    logger,
  }),
};

// Create and register message router
const messageRouter = createMessageRouter(handlers, logger);
runtimeAdapter.onMessage(messageRouter);

// Set up extension icon click
if (browser.action && browser.action.onClicked) {
  browser.action.onClicked.addListener(async (tab) => {
    logger.log(`Extension icon clicked on tab: ${tab.id}`);
    try {
      await panelAdapter.open({ tabId: tab.id });
    } catch (error) {
      logger.error("Failed to open panel:", error);
    }
  });
}

// Set up panel behavior (Chrome only)
panelAdapter.setPanelBehavior({ openPanelOnActionClick: true });

logger.log("Background service worker initialized");
