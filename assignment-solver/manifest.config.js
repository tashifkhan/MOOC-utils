/**
 * Dynamic manifest generation for Chrome and Firefox
 * Generates different manifests based on browser target
 */

const FIREFOX_ADDON_ID = "mooc-utils@tashif.codes";

/**
 * Generate manifest based on browser target
 * @param {string} browser - "chrome" or "firefox"
 * @returns {object} Manifest object
 */
export function generateManifest(browser) {
  const isFirefox = browser === "firefox";
  const isChrome = browser === "chrome";

  // Base manifest (common to both browsers)
  const baseManifest = {
    manifest_version: 3,
    name: "NPTEL Assignment Solver",
    version: "1.0.0",
    description: "AI-powered assignment solver for NPTEL courses using Gemini",
    
    permissions: [
      "activeTab",
      "tabs",
      "storage",
      "scripting",
    ],
    
    host_permissions: [
      "https://*.nptel.ac.in/*",
      "https://onlinecourses.nptel.ac.in/*",
      "https://generativelanguage.googleapis.com/*",
    ],
    
    background: {},
    
    content_scripts: [
      {
        matches: [
          "https://onlinecourses.nptel.ac.in/*",
        ],
        js: ["content.js"],
        run_at: "document_idle",
      },
    ],
  };

  // Browser-specific modifications
  if (isChrome) {
    // Chrome uses sidePanel API
    return {
      ...baseManifest,
      permissions: [...baseManifest.permissions, "sidePanel"],
      side_panel: {
        default_path: "sidepanel.html",
      },
      background: {
        ...baseManifest.background,
        service_worker: "background.js",
      },
    };
  }

  if (isFirefox) {
    // Firefox uses sidebarAction
    return {
      ...baseManifest,
      browser_specific_settings: {
        gecko: {
          id: FIREFOX_ADDON_ID,
          strict_min_version: "121.0",
        },
      },
      sidebar_action: {
        default_panel: "sidepanel.html",
        default_title: "NPTEL Assignment Solver",
        default_icon: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
        },
        open_at_install: true,
      },
      background: {
        ...baseManifest.background,
        scripts: ["background.js"],
      },
    };
  }

  return baseManifest;
}

export default generateManifest;
