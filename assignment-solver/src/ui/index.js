/**
 * @fileoverview Side panel UI entry point with DI setup
 */

import { createLogger } from "../core/logger.js";
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
