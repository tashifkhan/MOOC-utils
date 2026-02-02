/**
 * @fileoverview Message router for background service worker
 */

import { MESSAGE_TYPES } from "../core/messages.js";

/**
 * Create message router
 * @param {Object} deps - Dependencies
 * @param {Object} handlers - Message handlers by type
 * @param {Function} [logger] - Optional logger
 * @returns {Function} Listener function for chrome.runtime.onMessage
 */
export function createMessageRouter(handlers, logger = null) {
	const log = logger?.log || (() => {});

	return function handleMessage(message, sender, sendResponse) {
		log(`Received message: ${message.type}`);

		const handler = handlers[message.type];

		if (!handler) {
			log(`No handler for message type: ${message.type}`);
			sendResponse({ error: `Unknown message type: ${message.type}` });
			return false;
		}

		// Call handler asynchronously
		try {
			handler(message, sender, sendResponse);
			return true; // Keep channel open for async response
		} catch (error) {
			log(`Handler error: ${error.message}`);
			sendResponse({ error: error.message });
			return false;
		}
	};
}
