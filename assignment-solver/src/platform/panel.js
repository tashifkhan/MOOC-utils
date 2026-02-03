/**
 * Panel abstraction layer
 * Handles differences between Chrome sidePanel and Firefox sidebarAction
 * Provides a unified API for opening and managing the side panel/sidebar
 */

import { browser, isFirefox, isChrome, hasAPI } from "./browser.js";

/**
 * Create panel adapter
 * Abstracts the differences between Chrome sidePanel and Firefox sidebarAction
 * @param {Object} deps - Dependencies
 * @param {Object} [deps.logger] - Optional logger instance
 * @returns {object} Panel adapter with unified API
 */
export function createPanelAdapter({ logger = null } = {}) {
  const log = logger?.log || (() => {});
  const logError = logger?.error || console.error.bind(console, "[PanelAdapter]");
  
  const firefox = isFirefox();
  const chrome = isChrome();

  return {
    /**
     * Open the side panel/sidebar
     * @param {object} options - Opening options
     * @param {number} [options.tabId] - Tab ID to open for (Chrome only)
     * @returns {Promise<void>}
     */
    async open(options = {}) {
      try {
        if (firefox) {
          // Firefox uses sidebarAction.open()
          if (browser.sidebarAction && browser.sidebarAction.open) {
            await browser.sidebarAction.open();
          } else {
            throw new Error("sidebarAction API not available");
          }
        } else if (chrome) {
          // Chrome uses sidePanel.open()
          if (browser.sidePanel && browser.sidePanel.open) {
            await browser.sidePanel.open({ tabId: options.tabId });
          } else {
            throw new Error("sidePanel API not available");
          }
        }
      } catch (error) {
        logError("Failed to open panel:", error);
        throw error;
      }
    },

    /**
     * Close the side panel/sidebar
     * @returns {Promise<void>}
     */
    async close() {
      try {
        if (firefox) {
          // Firefox uses sidebarAction.close()
          if (browser.sidebarAction && browser.sidebarAction.close) {
            await browser.sidebarAction.close();
          }
        }
        // Chrome doesn't have a direct close API for sidePanel
      } catch (error) {
        logError("Failed to close panel:", error);
        throw error;
      }
    },

    /**
     * Set panel behavior (Chrome only)
     * Firefox doesn't have equivalent functionality
     * @param {object} options
     * @param {boolean} options.openPanelOnActionClick - Open panel when action icon clicked
     * @returns {Promise<void>}
     */
    async setPanelBehavior(options = {}) {
      if (chrome && browser.sidePanel && browser.sidePanel.setPanelBehavior) {
        try {
          await browser.sidePanel.setPanelBehavior({
            openPanelOnActionClick: options.openPanelOnActionClick ?? true,
          });
        } catch (error) {
          logError("Failed to set panel behavior:", error);
          // Non-critical error, don't throw
        }
      }
      // Firefox doesn't support this - silently ignore
    },

    /**
     * Check if panel APIs are available
     * @returns {boolean}
     */
    isAvailable() {
      if (firefox) {
        return hasAPI("sidebarAction.open");
      }
      if (chrome) {
        return hasAPI("sidePanel.open");
      }
      return false;
    },

    /**
     * Get the browser-specific panel type
     * @returns {string} "sidebar" for Firefox, "sidepanel" for Chrome
     */
    getPanelType() {
      return firefox ? "sidebar" : "sidepanel";
    },
  };
}

export default createPanelAdapter;
