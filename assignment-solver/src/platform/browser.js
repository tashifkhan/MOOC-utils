/**
 * Browser API polyfill wrapper
 * Provides a unified Promise-based API for Chrome and Firefox
 * Uses webextension-polyfill for cross-browser compatibility
 */

// Import the polyfill - it automatically detects the browser
// and provides a unified browser.* API
import browser from "webextension-polyfill";

/**
 * Export the browser API
 * This is the unified API that works on both Chrome and Firefox
 * All platform adapters should use this instead of direct chrome.* calls
 */
export { browser };

/**
 * Detect current browser
 * @returns {string} "chrome" or "firefox"
 */
export function detectBrowser() {
  // Check for Firefox-specific APIs
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.getBrowserInfo) {
    return "firefox";
  }
  
  // Check for Chrome-specific APIs
  if (typeof chrome !== "undefined" && chrome.sidePanel) {
    return "chrome";
  }
  
  // Default to chrome if can't detect
  return "chrome";
}

/**
 * Check if running in Firefox
 * @returns {boolean}
 */
export function isFirefox() {
  return detectBrowser() === "firefox";
}

/**
 * Check if running in Chrome
 * @returns {boolean}
 */
export function isChrome() {
  return detectBrowser() === "chrome";
}

/**
 * Safe API access - returns null if API doesn't exist
 * Useful for optional APIs that may not be available
 * @param {string} apiPath - Dot-separated path to API (e.g., "sidePanel.open")
 * @returns {Function|null}
 */
export function getOptionalAPI(apiPath) {
  const parts = apiPath.split(".");
  let current = browser;
  
  for (const part of parts) {
    if (current && typeof current[part] !== "undefined") {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return typeof current === "function" ? current : null;
}

/**
 * Check if an API is available
 * @param {string} apiPath - Dot-separated path to API
 * @returns {boolean}
 */
export function hasAPI(apiPath) {
  return getOptionalAPI(apiPath) !== null;
}
