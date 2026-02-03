/**
 * @fileoverview HTML and image extraction service for content script
 * Extracts assignment content and converts images to base64
 */

/**
 * Create extractor service
 * @param {Object} deps - Dependencies
 * @param {Object} [deps.logger] - Optional logger instance
 * @returns {Object} Extractor with extractPageHTML and extractImages methods
 */
export function createExtractor({ logger = null } = {}) {
	const log = logger?.log || (() => {});
	const warn = logger?.warn || (() => {});

	return {
		/**
		 * Extract the assignment HTML for Gemini to parse
		 * @returns {Object} Extracted page data including HTML, images, URL, etc.
		 */
		extractPageHTML() {
			log("Extracting page HTML...");

			// Look for common NPTEL assignment containers
			const selectors = [
				".assessment-contents",
				".qt-assessment",
				".gcb-assessment-contents",
				"#assessment-main",
				".qt-mc-question",
				'form[action*="answer"]',
				".gcb-lesson-content",
				"#gcb-main-content",
				".gcb-article",
			];

			let html = "";
			let container = null;

			// Try each selector
			for (const selector of selectors) {
				container = document.querySelector(selector);
				if (container) {
					log(`Found container: ${selector}`);
					html = container.outerHTML;
					break;
				}
			}

			// Fallback: get entire body if no container found
			if (!html) {
				log("No container found, using body");
				const main =
					document.querySelector("main") ||
					document.querySelector("#main-content") ||
					document.querySelector(".content") ||
					document.body;
				html = main.outerHTML;
				container = main;
			}

			// Extract images from the container
			const images = this.extractImages(container || document.body);

			// Find submit button
			const submitButton =
				document.querySelector("#submitbutton") ||
				document.querySelector('button[type="submit"]') ||
				document.querySelector(".submit-button") ||
				document.querySelector('[onclick*="submit"]');

			const submitButtonId = submitButton?.id || "submitbutton";
			log(`Submit button ID: ${submitButtonId}`);

			// Find confirmation dialog button IDs
			const confirmButtonIds = {
				not_all_attempt_submit:
					document.querySelector("#assessment-not-all-attempt-submit")?.id ||
					"assessment-not-all-attempt-submit",
				not_all_attempt_cancel:
					document.querySelector("#assessment-not-all-attempt-cancel")?.id ||
					"assessment-not-all-attempt-cancel",
				no_attempt_ok:
					document.querySelector("#assessment-no-attempt-ok")?.id ||
					"assessment-no-attempt-ok",
			};

			return {
				html: html,
				images: images,
				url: window.location.href,
				title: document.title,
				submitButtonId: submitButtonId,
				confirmButtonIds: confirmButtonIds,
			};
		},

		/**
		 * Extract images and convert to base64
		 * @param {HTMLElement} container - Container element to search for images
		 * @returns {Array<Object>} Array of extracted image objects
		 */
		extractImages(container) {
			const images = [];
			const imgElements = container.querySelectorAll("img");

			log(`Found ${imgElements.length} images`);

			for (const img of imgElements) {
				try {
					// Skip tiny images (likely icons)
					if (img.naturalWidth < 50 || img.naturalHeight < 50) continue;

					// Skip external images that aren't loaded
					if (!img.complete || img.naturalWidth === 0) continue;

					let base64Data = null;
					let mimeType = "image/png";

					// Check if it's already a data URL
					if (img.src.startsWith("data:")) {
						const match = img.src.match(/^data:([^;]+);base64,(.+)$/);
						if (match) {
							mimeType = match[1];
							base64Data = match[2];
						}
					} else {
						// Convert to base64 using canvas
						try {
							const canvas = document.createElement("canvas");
							canvas.width = img.naturalWidth;
							canvas.height = img.naturalHeight;
							const ctx = canvas.getContext("2d");
							ctx.drawImage(img, 0, 0);

							const dataUrl = canvas.toDataURL("image/png");
							const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
							if (match) {
								mimeType = match[1];
								base64Data = match[2];
							}
						} catch (canvasError) {
							// CORS error - skip this image
							log(`Cannot convert image (CORS): ${img.src}`);
							continue;
						}
					}

					if (base64Data) {
						// Get context - what question is this image near?
						const questionContainer = img.closest(
							'.qt-mc-question, .gcb-assessment-item, [class*="question"]',
						);
						const questionId =
							questionContainer?.id || img.id || `img-${images.length}`;

						images.push({
							id: questionId,
							mimeType: mimeType,
							base64: base64Data,
							alt: img.alt || "",
							width: img.naturalWidth,
							height: img.naturalHeight,
						});

						log(
							`Extracted image: ${questionId} ${img.naturalWidth}x${img.naturalHeight}`,
						);
					}
				} catch (error) {
					warn(`Error extracting image: ${error}`);
				}
			}

			return images;
		},

		/**
		 * Get quick page info for assignment detection
		 * @returns {Object} Page info with title and question count
		 */
		getPageInfo() {
			// Count questions on the page
			const questionSelectors = [
				".qt-mc-question",
				".gcb-assessment-item",
				".assessment-question",
				'[class*="question"]',
			];

			let questionCount = 0;
			for (const selector of questionSelectors) {
				const elements = document.querySelectorAll(selector);
				if (elements.length > questionCount) {
					questionCount = elements.length;
				}
			}

			// Try to extract assignment title from page
			let title = document.title;

			// Look for specific assignment title elements
			const titleSelectors = [
				".assessment-title",
				".gcb-assessment-title",
				"h1.assessment-heading",
				".unit-title",
				"h1",
			];

			for (const selector of titleSelectors) {
				const element = document.querySelector(selector);
				if (element && element.textContent.trim()) {
					title = element.textContent.trim();
					break;
				}
			}

			// Check if this is an assignment page
			const url = window.location.href;
			const isAssignment =
				(url.includes("nptel.ac.in") || url.includes("swayam.gov.in")) &&
				(url.includes("assessment") ||
					url.includes("assignment") ||
					url.includes("quiz") ||
					url.includes("exam") ||
					questionCount > 0);

			return {
				title: title,
				questionCount: questionCount,
				isAssignment: isAssignment,
				url: url,
			};
		},
	};
}

export default createExtractor;
