/**
 * @fileoverview Runtime API adapter for dependency injection
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { browser } from "./browser.js";

/**
 * Create a Runtime adapter
 * @returns {Object} Runtime adapter with sendMessage and onMessage methods
 */
export function createRuntimeAdapter() {
	return {
		/**
		 * Send a message to the background/content script
		 * @param {Message} message - Message to send
		 * @returns {Promise<any>} Response promise
		 */
		sendMessage: (message) => {
			return browser.runtime.sendMessage(message);
		},

		/**
		 * Listen for messages
		 * @param {(message: Message, sender: any, sendResponse: Function) => void} listener - Message handler
		 */
		onMessage: (listener) => {
			browser.runtime.onMessage.addListener(listener);
		},
	};
}
