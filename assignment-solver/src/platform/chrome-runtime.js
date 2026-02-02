/**
 * @fileoverview Chrome Runtime API adapter for dependency injection
 */

/**
 * Create a Chrome Runtime adapter
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
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage(message, (response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(response);
					}
				});
			});
		},

		/**
		 * Listen for messages
		 * @param {(message: Message, sender: any, sendResponse: Function) => void} listener - Message handler
		 */
		onMessage: (listener) => {
			chrome.runtime.onMessage.addListener(listener);
		},
	};
}
