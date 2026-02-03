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

		// Call handler asynchronously and ensure sendResponse is always called
		// CRITICAL: Must return true synchronously to keep message channel open in Firefox
		try {
			const result = handler(message, sender, sendResponse);
			
			// If handler returns a Promise, ensure we handle it properly
			if (result && typeof result.then === "function") {
				result
					.then(() => {
						// Handler completed successfully
						// Note: sendResponse should have been called by the handler
					})
					.catch((error) => {
						log(`Async handler error: ${error.message}`);
						// Only call sendResponse if it hasn't been called yet
						try {
							sendResponse({ error: error.message });
						} catch (e) {
							// sendResponse may have already been called
						}
					});
			}
			
			return true; // Keep channel open for async response - CRITICAL for Firefox
		} catch (error) {
			log(`Handler error: ${error.message}`);
			sendResponse({ error: error.message });
			return true; // Still return true to be safe
		}
	};
}
