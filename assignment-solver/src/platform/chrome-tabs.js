/**
 * @fileoverview Chrome Tabs API adapter for dependency injection
 */

/**
 * Create a Chrome Tabs adapter
 * @returns {Object} Tabs adapter with query, sendMessage, captureVisibleTab methods
 */
export function createTabsAdapter() {
	return {
		/**
		 * Query tabs
		 * @param {Object} queryInfo - Query filter
		 * @returns {Promise<Array<chrome.tabs.Tab>>}
		 */
		query: (queryInfo) => {
			return new Promise((resolve, reject) => {
				chrome.tabs.query(queryInfo, (tabs) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(tabs);
					}
				});
			});
		},

		/**
		 * Send message to content script
		 * @param {number} tabId - Tab ID
		 * @param {Message} message - Message to send
		 * @returns {Promise<any>}
		 */
		sendMessage: (tabId, message) => {
			return new Promise((resolve, reject) => {
				chrome.tabs.sendMessage(tabId, message, (response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(response);
					}
				});
			});
		},

		/**
		 * Capture visible tab
		 * @param {number} windowId - Window ID
		 * @param {Object} options - Capture options
		 * @returns {Promise<string>} Data URL
		 */
		captureVisibleTab: (windowId, options) => {
			return new Promise((resolve, reject) => {
				chrome.tabs.captureVisibleTab(windowId, options, (dataUrl) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(dataUrl);
					}
				});
			});
		},
	};
}
