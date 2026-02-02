/**
 * @fileoverview Screenshot capture service for full-page screenshots
 */

/**
 * Create a screenshot service
 * @param {Object} deps - Dependencies
 * @param {Object} deps.tabs - Tabs adapter
 * @param {Object} deps.scripting - Scripting adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Screenshot service
 */
export function createScreenshotService({ tabs, scripting, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Capture full page by scrolling and capturing each viewport
		 * @param {number} tabId - Tab to capture
		 * @param {number} windowId - Window ID for capture
		 * @returns {Promise<Array<Screenshot>>}
		 */
		async captureFullPage(tabId, windowId) {
			log("Starting full page capture...");

			// Get page dimensions
			let scrollInfo;
			try {
				const results = await scripting.executeScript({
					target: { tabId: tabId },
					func: () => ({
						scrollHeight: document.documentElement.scrollHeight,
						clientHeight: window.innerHeight,
						scrollWidth: document.documentElement.scrollWidth,
						clientWidth: window.innerWidth,
						currentScrollY: window.scrollY,
					}),
				});
				scrollInfo = results[0].result;
				log(`Page dimensions: ${JSON.stringify(scrollInfo)}`);
			} catch (e) {
				log(`Failed to get scroll info: ${e.message}`);
				throw new Error("Failed to get page dimensions: " + e.message);
			}

			const { scrollHeight, clientHeight, currentScrollY } = scrollInfo;
			const screenshots = [];

			// Calculate number of screenshots needed
			const numScreenshots = Math.ceil(scrollHeight / clientHeight);
			log(`Need ${numScreenshots} screenshots`);

			// Limit to max 8 screenshots to avoid API limits
			const maxScreenshots = Math.min(numScreenshots, 8);

			for (let i = 0; i < maxScreenshots; i++) {
				const scrollY = i * clientHeight;

				// Scroll to position
				try {
					await scripting.executeScript({
						target: { tabId: tabId },
						func: (y) => window.scrollTo(0, y),
						args: [scrollY],
					});
				} catch (e) {
					log(`Scroll failed: ${e.message}`);
					continue;
				}

				// Wait for scroll and render
				await new Promise((r) => setTimeout(r, 350));

				try {
					// Capture visible tab
					const dataUrl = await tabs.captureVisibleTab(windowId, {
						format: "jpeg",
						quality: 60,
					});

					// Extract base64 from data URL
					const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
					if (match) {
						screenshots.push({
							mimeType: match[1],
							base64: match[2],
							scrollY: scrollY,
							index: i + 1,
							total: maxScreenshots,
						});
						log(`Captured screenshot ${i + 1}/${maxScreenshots}`);
					}
				} catch (captureError) {
					log(`Capture error at scroll ${scrollY}: ${captureError.message}`);
					// Continue with remaining screenshots
				}
			}

			// Restore original scroll position
			try {
				await scripting.executeScript({
					target: { tabId: tabId },
					func: (y) => window.scrollTo(0, y),
					args: [currentScrollY],
				});
			} catch (e) {
				log(`Could not restore scroll position: ${e.message}`);
			}

			log(`Total screenshots captured: ${screenshots.length}`);
			return screenshots;
		},
	};
}
