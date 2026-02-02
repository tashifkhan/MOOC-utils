/**
 * @fileoverview Tabs API adapter for dependency injection
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { browser } from "./browser.js";

/**
 * Create a Tabs adapter
 * @returns {Object} Tabs adapter with query, sendMessage, captureVisibleTab methods
 */
export function createTabsAdapter() {
	return {
		/**
		 * Query tabs
		 * @param {Object} queryInfo - Query filter
		 * @returns {Promise<Array<browser.tabs.Tab>>}
		 */
		query: (queryInfo) => {
			return browser.tabs.query(queryInfo);
		},

		/**
		 * Send message to content script
		 * @param {number} tabId - Tab ID
		 * @param {Message} message - Message to send
		 * @returns {Promise<any>}
		 */
		sendMessage: (tabId, message) => {
			return browser.tabs.sendMessage(tabId, message);
		},

		/**
		 * Capture visible tab
		 * @param {number} windowId - Window ID
		 * @param {Object} options - Capture options
		 * @returns {Promise<string>} Data URL
		 */
		captureVisibleTab: (windowId, options) => {
			return browser.tabs.captureVisibleTab(windowId, options);
		},
	};
}
