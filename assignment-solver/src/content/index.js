/**
 * @fileoverview Content script entry point for NPTEL Assignment Solver
 * Handles message passing between background script and page DOM
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { browser } from "../platform/browser.js";
import { createLogger } from "./logger.js";
import { createExtractor } from "./extractor.js";
import { createApplicator } from "./applicator.js";

const logger = createLogger("Content");
logger.log("Content script loaded on:", window.location.href);

// Initialize services
const extractor = createExtractor();
const applicator = createApplicator();

// Set up message listener
browser.runtime.onMessage.addListener((message, sender) => {
	logger.log(`Received message: ${message.type}`);

	// Return a promise for async responses
	return new Promise((resolve) => {
		try {
			switch (message.type) {
				case "PING":
					// Health check - respond to confirm script is loaded
					resolve({ pong: true });
					break;

				case "GET_PAGE_HTML":
					const pageData = extractor.extractPageHTML();
					resolve(pageData);
					break;

				case "SCROLL_INFO":
					// Get page dimensions for screenshot capture
					resolve({
						scrollHeight: document.documentElement.scrollHeight,
						clientHeight: window.innerHeight,
						scrollWidth: document.documentElement.scrollWidth,
						clientWidth: window.innerWidth,
						currentScrollY: window.scrollY,
						devicePixelRatio: window.devicePixelRatio || 1,
					});
					break;

				case "SCROLL_TO":
					// Scroll to position for screenshot capture
					window.scrollTo(0, message.y);
					// Wait for scroll to complete
					setTimeout(() => {
						resolve({
							scrolledTo: window.scrollY,
							success: true,
						});
					}, 100);
					break;

				case "APPLY_ANSWERS":
					applicator.applyAnswers(message.answers);
					resolve({ success: true });
					break;

				case "SUBMIT_ASSIGNMENT":
					applicator.submitAssignment(message.submitButtonId, message.confirmButtonIds);
					resolve({ success: true });
					break;

				default:
					resolve({ error: "Unknown message type: " + message.type });
			}
		} catch (error) {
			logger.error(`Error: ${error.message}`);
			resolve({ error: error.message });
		}
	});
});

logger.log("Content script initialized");
