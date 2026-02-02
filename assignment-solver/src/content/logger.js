/**
 * @fileoverview Logger factory for content script
 * Creates prefixed loggers for different components
 */

/**
 * Create logger with prefix
 * @param {string} prefix - Log prefix
 * @returns {Object} Logger with log, warn, error methods
 */
export function createLogger(prefix) {
	return {
		log: (msg) => console.log(`[${prefix}]`, msg),
		warn: (msg) => console.warn(`[${prefix}]`, msg),
		error: (msg) => console.error(`[${prefix}]`, msg),
	};
}

export default createLogger;
