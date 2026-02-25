/**
 * @fileoverview Message type constants for the extension
 */

export const MESSAGE_TYPES = {
  // Content script communication
  PING: "PING",
  GET_PAGE_HTML: "GET_PAGE_HTML",
  GET_PAGE_INFO: "GET_PAGE_INFO",
  APPLY_ANSWERS: "APPLY_ANSWERS",
  SUBMIT_ASSIGNMENT: "SUBMIT_ASSIGNMENT",

  // Background communication
  EXTRACT_HTML: "EXTRACT_HTML",
  CAPTURE_FULL_PAGE: "CAPTURE_FULL_PAGE",
  GEMINI_REQUEST: "GEMINI_REQUEST",
  GEMINI_DEBUG: "GEMINI_DEBUG",

  // Internal
  SCROLL_INFO: "SCROLL_INFO",
  SCROLL_TO: "SCROLL_TO",
  TAB_UPDATED: "TAB_UPDATED",
};

/**
 * Create a message of a specific type
 * @param {string} type - Message type
 * @param {any} [payload] - Optional payload
 * @returns {Message}
 */
export function createMessage(type, payload) {
  return { type, ...(payload && { payload }) };
}

/**
 * Send a message with retry logic for transient connection failures
 * This is especially important for Firefox where the background script
 * may take longer to initialize or respond
 * @param {Object} runtime - Runtime adapter with sendMessage method
 * @param {Message} message - Message to send
 * @param {Object} options - Retry options
 * @param {number} [options.maxRetries=3] - Maximum number of retries
 * @param {number} [options.baseDelay=150] - Base delay in ms (will be multiplied by retry count)
 * @param {Function} [options.logger] - Optional logger function
 * @returns {Promise<any>} Response from background script
 */
export async function sendMessageWithRetry(
  runtime,
  message,
  { maxRetries = 3, baseDelay = 150, logger = null } = {},
) {
  const log = logger || (() => {});
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * attempt;
        log(`Retry attempt ${attempt}/${maxRetries - 1} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const response = await runtime.sendMessage(message);
      return response;
    } catch (error) {
      lastError = error;
      const errorMsg = error?.message || String(error);

      // Check if this is a connection error that warrants retry
      const isConnectionError =
        errorMsg.includes("Receiving end does not exist") ||
        errorMsg.includes("Could not establish connection") ||
        errorMsg.includes("Extension context invalidated") ||
        errorMsg.includes("The message port closed");

      if (!isConnectionError) {
        // Non-connection error, don't retry
        throw error;
      }

      log(`Connection error on attempt ${attempt + 1}: ${errorMsg}`);

      if (attempt === maxRetries - 1) {
        // Final attempt failed
        throw new Error(
          `Failed to communicate with background script after ${maxRetries} attempts. ` +
            `Last error: ${errorMsg}. ` +
            `Try reloading the extension or refreshing the page.`,
        );
      }
    }
  }

  throw lastError;
}
