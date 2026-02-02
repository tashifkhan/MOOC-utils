/**
 * @fileoverview Content script for NPTEL Assignment Solver
 * Handles HTML extraction, image extraction, and answer application
 * Note: Content scripts can't use ES modules in Chrome extensions without bundling,
 * so we use internal factory functions instead of importing modules.
 */

console.log("[NPTEL Solver] Content script loaded on:", window.location.href);

// ============================================================================
// FACTORIES (Internal DI pattern for content script)
// ============================================================================

/**
 * Create logger with prefix
 */
function createLogger(prefix) {
	return {
		log: (msg) => console.log(`[${prefix}]`, msg),
		warn: (msg) => console.warn(`[${prefix}]`, msg),
		error: (msg) => console.error(`[${prefix}]`, msg),
	};
}

/**
 * Create extractor service
 */
function createExtractor(logger) {
	const log = logger.log;

	return {
		/**
		 * Extract the assignment HTML for Gemini to parse
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
					logger.warn(`Error extracting image: ${error}`);
				}
			}

			return images;
		},
	};
}

/**
 * Create applicator service
 */
function createApplicator(logger) {
	const log = logger.log;

	return {
		/**
		 * Apply user answers to the page
		 */
		applyAnswers(answers) {
			log(`Applying ${answers?.length} answers`);

			if (!answers || !Array.isArray(answers)) {
				logger.error("Invalid answers array");
				return;
			}

			for (const answer of answers) {
				try {
					switch (answer.question_type) {
						case "single_choice":
							this.applySingleChoice(answer);
							break;
						case "multi_choice":
							this.applyMultiChoice(answer);
							break;
						case "fill_blank":
							this.applyFillBlank(answer);
							break;
						default:
							log(`Unknown question type: ${answer.question_type}`);
					}
				} catch (error) {
					log(`Error applying answer: ${error}`);
				}
			}
		},

		/**
		 * Apply single choice (radio button) answer
		 */
		applySingleChoice(answer) {
			const optionId = answer.answer_option_id;
			if (!optionId) {
				log("No option ID for single choice");
				return;
			}

			log(`Applying single choice: ${optionId}`);

			// Try by ID first
			let element = document.getElementById(optionId);

			// Try by value attribute
			if (!element) {
				element = document.querySelector(
					`input[type="radio"][value="${optionId}"]`,
				);
			}

			// Try by name containing question ID
			if (!element && answer.question_id) {
				const radios = document.querySelectorAll(
					`input[type="radio"][name*="${answer.question_id}"]`,
				);
				for (const radio of radios) {
					if (radio.value === optionId || radio.id === optionId) {
						element = radio;
						break;
					}
				}
			}

			// Try finding by partial ID match
			if (!element) {
				element = document.querySelector(
					`input[type="radio"][id*="${optionId}"]`,
				);
			}

			if (element) {
				element.click();
				element.dispatchEvent(new Event("change", { bubbles: true }));
				log(`Clicked radio: ${element.id}`);
			} else {
				log(`Radio not found: ${optionId}`);
			}
		},

		/**
		 * Apply multi choice (checkbox) answers
		 */
		applyMultiChoice(answer) {
			const optionIds = Array.isArray(answer.answer_option_id)
				? answer.answer_option_id
				: [answer.answer_option_id];

			log(`Applying multi choice: ${optionIds}`);

			// Find all checkboxes for this question
			const checkboxes = document.querySelectorAll(
				`input[type="checkbox"][name*="${answer.question_id}"], ` +
					`input[type="checkbox"][id*="${answer.question_id}"]`,
			);

			for (const checkbox of checkboxes) {
				const shouldBeChecked =
					optionIds.includes(checkbox.id) || optionIds.includes(checkbox.value);

				if (checkbox.checked !== shouldBeChecked) {
					checkbox.click();
					checkbox.dispatchEvent(new Event("change", { bubbles: true }));
				}
			}

			// Also try direct ID lookup for each option
			for (const optionId of optionIds) {
				let element = document.getElementById(optionId);
				if (!element) {
					element = document.querySelector(
						`input[type="checkbox"][value="${optionId}"]`,
					);
				}
				if (!element) {
					element = document.querySelector(
						`input[type="checkbox"][id*="${optionId}"]`,
					);
				}
				if (element && !element.checked) {
					element.click();
					element.dispatchEvent(new Event("change", { bubbles: true }));
					log(`Clicked checkbox: ${element.id}`);
				}
			}
		},

		/**
		 * Apply fill in the blank answer
		 */
		applyFillBlank(answer) {
			const inputId = answer.answer_option_id;
			const text = answer.answer_text;

			log(`Applying fill blank: ${inputId}`);

			if (!text) {
				log("No text for fill blank");
				return;
			}

			// Try by ID
			let input = document.getElementById(inputId);

			// Try by question ID
			if (!input && answer.question_id) {
				input = document.querySelector(
					`input[id*="${answer.question_id}"], ` +
						`textarea[id*="${answer.question_id}"], ` +
						`input[name*="${answer.question_id}"], ` +
						`textarea[name*="${answer.question_id}"]`,
				);
			}

			// Try any text input in the question container
			if (!input && inputId) {
				input =
					document.querySelector(`input[id*="${inputId}"]`) ||
					document.querySelector(`textarea[id*="${inputId}"]`);
			}

			if (input) {
				input.value = text;
				input.dispatchEvent(new Event("input", { bubbles: true }));
				input.dispatchEvent(new Event("change", { bubbles: true }));
				input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
				log(`Filled input: ${input.id}`);
			} else {
				log(`Input not found: ${inputId}`);
			}
		},

		/**
		 * Submit the assignment
		 */
		submitAssignment(submitButtonId, confirmButtonIds) {
			log("Submitting assignment...");

			const submitButton =
				document.getElementById(submitButtonId) ||
				document.querySelector("#submitbutton") ||
				document.querySelector('button[type="submit"]') ||
				document.querySelector('[onclick*="submit"]');

			if (submitButton) {
				submitButton.click();
				log("Submit clicked");
			} else {
				log("Submit button not found");
			}
		},
	};
}

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const logger = createLogger("NPTEL Solver");
const extractor = createExtractor(logger);
const applicator = createApplicator(logger);

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	logger.log(`Received message: ${message.type}`);

	try {
		switch (message.type) {
			case "PING":
				// Health check - respond to confirm script is loaded
				sendResponse({ pong: true });
				break;

			case "GET_PAGE_HTML":
				const pageData = extractor.extractPageHTML();
				sendResponse(pageData);
				break;

			case "SCROLL_INFO":
				// Get page dimensions for screenshot capture
				sendResponse({
					scrollHeight: document.documentElement.scrollHeight,
					clientHeight: window.innerHeight,
					scrollWidth: document.documentElement.scrollWidth,
					clientWidth: window.innerWidth,
					currentScrollY: window.scrollY,
					devicePixelRatio: window.devicePixelRatio || 1,
				});
				break;

			case "SCROLL_TO":
				// Scroll to position for screenshot capture
				window.scrollTo(0, message.y);
				// Wait for scroll to complete
				setTimeout(() => {
					sendResponse({
						scrolledTo: window.scrollY,
						success: true,
					});
				}, 100);
				return true; // Keep channel open for async

			case "APPLY_ANSWERS":
				applicator.applyAnswers(message.answers);
				sendResponse({ success: true });
				break;

			case "SUBMIT_ASSIGNMENT":
				applicator.submitAssignment(message.submitButtonId, message.confirmButtonIds);
				sendResponse({ success: true });
				break;

			default:
				sendResponse({ error: "Unknown message type: " + message.type });
		}
	} catch (error) {
		logger.error(`Error: ${error.message}`);
		sendResponse({ error: error.message });
	}

	return true; // Keep channel open
});

logger.log("Content script initialized");
