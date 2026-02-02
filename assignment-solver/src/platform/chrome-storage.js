/**
 * @fileoverview Chrome Storage API adapter for dependency injection
 */

/**
 * Create a Chrome Storage adapter
 * @returns {Object} Storage adapter with get, set, remove methods
 */
export function createStorageAdapter() {
	return {
		/**
		 * Get value from storage
		 * @param {string|string[]} keys - Key(s) to retrieve
		 * @returns {Promise<Object>} Storage object
		 */
		get: (keys) => {
			return chrome.storage.local.get(keys);
		},

		/**
		 * Set value in storage
		 * @param {Object} data - Key-value pairs to store
		 * @returns {Promise<void>}
		 */
		set: (data) => {
			return chrome.storage.local.set(data);
		},

		/**
		 * Remove value from storage
		 * @param {string|string[]} keys - Key(s) to remove
		 * @returns {Promise<void>}
		 */
		remove: (keys) => {
			return chrome.storage.local.remove(keys);
		},
	};
}
