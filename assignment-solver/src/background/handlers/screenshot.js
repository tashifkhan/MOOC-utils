/**
 * @fileoverview Handler for CAPTURE_FULL_PAGE message
 */

/**
 * Create screenshot handler
 * @param {Object} deps - Dependencies
 * @param {Object} deps.screenshotService - Screenshot service
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Function} Handler function
 */
export function createScreenshotHandler({ screenshotService, logger = null }) {
	const log = logger?.log || (() => {});

	return async function handleCaptureFullPage(message, sender, sendResponse) {
		try {
			log("Handling CAPTURE_FULL_PAGE request");
			const { tabId, windowId } = message;

			const screenshots = await screenshotService.captureFullPage(tabId, windowId);
			log(`Captured ${screenshots.length} screenshots`);

			sendResponse({ screenshots });
		} catch (error) {
			log(`Screenshot handler error: ${error.message}`);
			sendResponse({ error: error.message, screenshots: [] });
		}
	};
}
