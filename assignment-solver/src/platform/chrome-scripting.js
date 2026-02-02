/**
 * @fileoverview Chrome Scripting API adapter for dependency injection
 */

/**
 * Create a Chrome Scripting adapter
 * @returns {Object} Scripting adapter with executeScript method
 */
export function createScriptingAdapter() {
	return {
		/**
		 * Execute a script in a tab
		 * @param {Object} options - Execution options
		 * @param {Object} options.target - Target tab/frame
		 * @param {Function|string} [options.func] - Function to execute
		 * @param {Array<any>} [options.args] - Function arguments
		 * @param {Array<string>} [options.files] - Script files to execute
		 * @returns {Promise<Array<{result: any}>>} Execution results
		 */
		executeScript: (options) => {
			return new Promise((resolve, reject) => {
				chrome.scripting.executeScript(options, (results) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(results);
					}
				});
			});
		},
	};
}
