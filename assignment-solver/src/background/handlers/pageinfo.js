/**
 * @fileoverview Page info handler for assignment detection
 */

import { MESSAGE_TYPES } from "../../core/messages.js";

/**
 * Create page info handler
 * @param {Object} deps - Dependencies
 * @param {Object} deps.tabs - Tabs adapter
 * @param {Object} deps.scripting - Scripting adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Function} Handler function
 */
export function createPageInfoHandler({ tabs, scripting, logger = null }) {
	const log = logger?.log || (() => {});

	return async function handlePageInfo(message, sender, sendResponse) {
		try {
			log("Getting page info for assignment detection");

			// Get active tab
			const activeTabs = await tabs.query({ active: true, currentWindow: true });
			if (!activeTabs?.length) {
				sendResponse({ isAssignment: false, error: "No active tab" });
				return;
			}

			const activeTab = activeTabs[0];
			const tabId = activeTab.id;

			// Check if we're on an NPTEL assignment page
			const url = activeTab.url || "";
			const isNPTEL = url.includes("nptel.ac.in") || url.includes("swayam.gov.in");
			const isAssignment = isNPTEL && (
				url.includes("assessment") ||
				url.includes("assignment") ||
				url.includes("quiz") ||
				url.includes("exam")
			);

			if (!isAssignment) {
				sendResponse({ isAssignment: false });
				return;
			}

			// Try to ping content script
			let hasContentScript = false;
			try {
				await tabs.sendMessage(tabId, { type: MESSAGE_TYPES.PING });
				hasContentScript = true;
			} catch {
				log("Content script not loaded, injecting...");
			}

			// Inject content script if needed
			if (!hasContentScript) {
				try {
					await scripting.executeScript({
						target: { tabId },
						files: ["content.js"],
					});
					// Wait a bit for script to initialize
					await new Promise((resolve) => setTimeout(resolve, 100));
				} catch (injectError) {
					log(`Failed to inject content script: ${injectError.message}`);
				}
			}

			// Get page info from content script
			const pageData = await tabs.sendMessage(tabId, {
				type: MESSAGE_TYPES.GET_PAGE_INFO,
			});

			sendResponse({
				isAssignment: true,
				title: pageData?.title || activeTab.title || "Assignment",
				questionCount: pageData?.questionCount || 0,
				url: url,
			});
		} catch (error) {
			log(`Page info error: ${error.message}`);
			sendResponse({ isAssignment: false, error: error.message });
		}
	};
}
