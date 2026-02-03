/**
 * @fileoverview Message type constants for the extension
 */

export const MESSAGE_TYPES = {
	// Content script communication
	PING: "PING",
	GET_PAGE_HTML: "GET_PAGE_HTML",
	GET_PAGE_INFO: "GET_PAGE_INFO",
	APPLY_ANSWERS: "APPLY_ANSWERS",
	SUBMIT_ASSIGNMENT: "SUBMIT_ASSIGNMENT",

	// Background communication
	EXTRACT_HTML: "EXTRACT_HTML",
	CAPTURE_FULL_PAGE: "CAPTURE_FULL_PAGE",
	GEMINI_REQUEST: "GEMINI_REQUEST",

	// Internal
	SCROLL_INFO: "SCROLL_INFO",
	SCROLL_TO: "SCROLL_TO",
	TAB_UPDATED: "TAB_UPDATED",
};

/**
 * Create a message of a specific type
 * @param {string} type - Message type
 * @param {any} [payload] - Optional payload
 * @returns {Message}
 */
export function createMessage(type, payload) {
	return { type, ...(payload && { payload }) };
}
