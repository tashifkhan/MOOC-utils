/**
 * @fileoverview Handler for EXTRACT_HTML message
 */

import { MESSAGE_TYPES } from "../../core/messages.js";

/**
 * Create extraction handler
 * @param {Object} deps - Dependencies
 * @param {Object} deps.tabs - Tabs adapter
 * @param {Object} deps.scripting - Scripting adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Function} Handler function
 */
export function createExtractionHandler({ tabs, scripting, logger = null }) {
	const log = logger?.log || (() => {});

	return async function handleExtractHtml(message, sender, sendResponse) {
		try {
			log("Handling EXTRACT_HTML request");

			// Get active tab
			const activeTab = await tabs.query({ active: true, currentWindow: true });
			if (!activeTab || !activeTab[0]) {
				sendResponse({ error: "No active tab found" });
				return;
			}

			const tabId = activeTab[0].id;
			const windowId = activeTab[0].windowId;

			log(`Using Tab ID: ${tabId}, Window ID: ${windowId}`);

			// Ping content script to check if loaded
			try {
				await tabs.sendMessage(tabId, { type: MESSAGE_TYPES.PING });
				log("Content script already loaded");
			} catch (error) {
				log("Content script not loaded, injecting...");
				try {
					await scripting.executeScript({
						target: { tabId: tabId },
						files: ["content.js"],
					});
					log("Content script injected successfully");
					await new Promise((r) => setTimeout(r, 100));
				} catch (injectError) {
					log(`Failed to inject content script: ${injectError.message}`);
					sendResponse({
						error: "Failed to load content script. Please refresh the page.",
					});
					return;
				}
			}

			// Request page HTML from content script
			try {
				const response = await tabs.sendMessage(tabId, {
					type: MESSAGE_TYPES.GET_PAGE_HTML,
				});

				sendResponse({
					...response,
					tabId: tabId,
					windowId: windowId,
				});
			} catch (error) {
				log(`Error getting page HTML: ${error.message}`);
				sendResponse({
					error: error.message || "Content script not responding. Please refresh the page.",
				});
			}
		} catch (error) {
			log(`Extraction handler error: ${error.message}`);
			sendResponse({ error: error.message });
		}
	};
}
