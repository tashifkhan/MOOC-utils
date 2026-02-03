/**
 * @fileoverview Handlers for APPLY_ANSWERS and SUBMIT_ASSIGNMENT messages
 */

import { MESSAGE_TYPES } from "../../core/messages.js";

/**
 * Create answer handler
 * @param {Object} deps - Dependencies
 * @param {Object} deps.tabs - Tabs adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Function} Handler function
 */
export function createAnswerHandler({ tabs, scripting, logger = null }) {
	const log = logger?.log || (() => {});

	return async function handleAnswerMessage(message, sender, sendResponse) {
		try {
			const activeTab = await tabs.query({ active: true, currentWindow: true });
			if (!activeTab || !activeTab[0]) {
				sendResponse({ error: "No active tab found" });
				return;
			}

			const tabId = activeTab[0].id;

			try {
				await tabs.sendMessage(tabId, { type: MESSAGE_TYPES.PING });
			} catch (error) {
				log("Content script not loaded, injecting...");
				try {
				await scripting.executeScript({
					target: { tabId: tabId },
					files: ["content.js"],
				});
				// Longer delay for Firefox to ensure script is fully initialized
				await new Promise((r) => setTimeout(r, 300));
				// Verify content script is responding
				try {
					await tabs.sendMessage(tabId, { type: MESSAGE_TYPES.PING });
					log("Content script verified after injection");
				} catch (verifyError) {
					log(`Content script verification failed: ${verifyError.message}`);
					// Try one more time with longer delay
					await new Promise((r) => setTimeout(r, 200));
				}
				} catch (injectError) {
					log(`Failed to inject content script: ${injectError.message}`);
					sendResponse({
						error: "Failed to load content script. Please refresh the page.",
					});
					return;
				}
			}

			// Forward the message to content script
			try {
				const response = await tabs.sendMessage(tabId, message);
				sendResponse(response || { success: true });
			} catch (error) {
				log(`Error forwarding message: ${error.message}`);
				sendResponse({ error: error.message });
			}
		} catch (error) {
			log(`Answer handler error: ${error.message}`);
			sendResponse({ error: error.message });
		}
	};
}
