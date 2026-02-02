/**
 * @fileoverview Background service worker entry point with DI setup
 */

import { createLogger } from "../core/logger.js";
import { MESSAGE_TYPES } from "../core/messages.js";
import { createRuntimeAdapter } from "../platform/chrome-runtime.js";
import { createTabsAdapter } from "../platform/chrome-tabs.js";
import { createScriptingAdapter } from "../platform/chrome-scripting.js";
import { createGeminiService } from "../services/gemini/index.js";
import { createScreenshotService } from "./screenshot.js";
import { createExtractionHandler } from "./handlers/extraction.js";
import { createScreenshotHandler } from "./handlers/screenshot.js";
import { createGeminiHandler } from "./handlers/gemini.js";
import { createAnswerHandler } from "./handlers/answers.js";
import { createMessageRouter } from "./router.js";

// Initialize logger
const logger = createLogger("Background");

// Initialize platform adapters
const runtimeAdapter = createRuntimeAdapter();
const tabsAdapter = createTabsAdapter();
const scriptingAdapter = createScriptingAdapter();

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
	[MESSAGE_TYPES.EXTRACT_HTML]: createExtractionHandler({
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
chrome.runtime.onMessage.addListener(messageRouter);

// Set up extension icon click
chrome.action.onClicked.addListener((tab) => {
	logger.log(`Extension icon clicked on tab: ${tab.id}`);
	chrome.sidePanel.open({ tabId: tab.id });
});

// Enable side panel for NPTEL pages
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

logger.log("Background service worker initialized");
