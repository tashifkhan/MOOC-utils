/**
 * @fileoverview Logger factory for creating loggers with context prefixes
 */

/**
 * Create a logger with a specific context prefix
 * @param {string} prefix - Context prefix for all log messages
 * @returns {Logger} Logger instance with log, info, warn, error, debug methods
 */
export function createLogger(prefix) {
	return {
		log: (msg) => console.log(`[${prefix}]`, msg),
		info: (msg) => console.info(`[${prefix}]`, msg),
		warn: (msg) => console.warn(`[${prefix}]`, msg),
		error: (msg) => console.error(`[${prefix}]`, msg),
		debug: (msg) => console.debug(`[${prefix}]`, msg),
	};
}
