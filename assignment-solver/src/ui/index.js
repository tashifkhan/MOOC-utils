/**
 * @fileoverview Side panel UI entry point with DI setup
 */

import { createLogger } from "../core/logger.js";
import { MESSAGE_TYPES, sendMessageWithRetry } from "../core/messages.js";
import { createRuntimeAdapter } from "../platform/runtime.js";
import { createStorageAdapter } from "../platform/storage.js";
import { createStorageService } from "../services/storage/index.js";
import { createGeminiService } from "../services/gemini/index.js";
import { getElements } from "./elements.js";
import { createStateManager } from "./state.js";
import { createProgressController } from "./controllers/progress.js";
import { createSettingsController } from "./controllers/settings.js";
import { createSolveController } from "./controllers/solve.js";
import { createDetectionController } from "./controllers/detection.js";

/**
 * Wait for background script to be ready
 * This is important for Firefox where the sidebar can load before the background
 * @param {Object} runtime - Runtime adapter
 * @param {Function} logger - Logger function
 * @param {number} maxAttempts - Maximum ping attempts
 * @returns {Promise<boolean>} True if background is ready
 */
async function waitForBackgroundReady(runtime, logger, maxAttempts = 5) {
	logger.log("Checking if background script is ready...");

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			// Try to ping the background script
			const response = await runtime.sendMessage({ type: MESSAGE_TYPES.PING });
			if (response?.pong) {
				logger.log("Background script is ready");
				return true;
			}
		} catch (error) {
			logger.log(`Background not ready (attempt ${attempt}/${maxAttempts}): ${error.message}`);
			if (attempt < maxAttempts) {
				// Wait before next attempt (exponential backoff)
				const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	logger.warn("Background script may not be ready, continuing anyway...");
	return false;
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
	const logger = createLogger("SidePanel");
	logger.log("Initializing side panel");

	// Get DOM elements
	const elements = getElements();

	// Initialize adapters
	const storageAdapter = createStorageAdapter();
	const runtimeAdapter = createRuntimeAdapter();

	// Initialize services
	const storage = createStorageService({ storage: storageAdapter, logger });
	const gemini = createGeminiService({ runtime: runtimeAdapter, logger });

	// Initialize state
	const state = createStateManager();

	// Initialize controllers
	const progress = createProgressController({ elements, logger });
	const settings = createSettingsController({ elements, storage, logger });
	const solve = createSolveController({
		elements,
		state,
		storage,
		gemini,
		runtime: runtimeAdapter,
		progress,
		settings,
		logger,
	});
	const detection = createDetectionController({
		elements,
		runtime: runtimeAdapter,
		logger,
	});

	// Load API key on startup
	const apiKey = await storage.getApiKey();
	if (apiKey && elements.apiKeyInput) {
		elements.apiKeyInput.value = apiKey;
	}

	// Wait for background script to be ready (important for Firefox)
	await waitForBackgroundReady(runtimeAdapter, logger);

	// Initialize event listeners
	solve.initEventListeners();
	settings.initEventListeners({
		onSaved: () => {
			progress.setStatus("API key saved");
		},
	});

	// Initialize assignment detection
	detection.init();

	logger.log("Side panel initialized");
});
