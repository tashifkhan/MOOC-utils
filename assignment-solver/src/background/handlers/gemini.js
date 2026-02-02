/**
 * @fileoverview Handler for GEMINI_REQUEST message
 */

/**
 * Create Gemini handler
 * @param {Object} deps - Dependencies
 * @param {Object} deps.geminiService - Gemini service
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Function} Handler function
 */
export function createGeminiHandler({ geminiService, logger = null }) {
	const log = logger?.log || (() => {});

	return async function handleGeminiRequest(message, sender, sendResponse) {
		try {
			log("Handling GEMINI_REQUEST");
			const { apiKey, payload } = message;

			// Use direct API call from background worker
			const response = await geminiService.directAPICall(apiKey, payload);
			log("Gemini API response received");

			sendResponse(response);
		} catch (error) {
			log(`Gemini handler error: ${error.message}`);
			sendResponse({ error: error.message });
		}
	};
}
