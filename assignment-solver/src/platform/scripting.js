/**
 * @fileoverview Scripting API adapter for dependency injection
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { browser } from "./browser.js";

/**
 * Create a Scripting adapter
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
			return browser.scripting.executeScript(options);
		},
	};
}
