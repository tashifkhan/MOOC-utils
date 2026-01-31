// Content script for NPTEL Assignment Solver
// Handles HTML extraction and answer application

console.log("[NPTEL Solver] Content script loaded on:", window.location.href);

// Listen for messages from background/side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("[NPTEL Solver] Received message:", message.type);

	try {
		switch (message.type) {
			case "PING":
				// Health check - respond to confirm script is loaded
				sendResponse({ pong: true });
				break;

			case "GET_PAGE_HTML":
				const pageData = extractPageHTML();
				console.log(
					"[NPTEL Solver] Extracted HTML length:",
					pageData.html?.length,
					"Images:",
					pageData.images?.length,
				);
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
				applyAnswers(message.answers);
				sendResponse({ success: true });
				break;

			case "SUBMIT_ASSIGNMENT":
				submitAssignment(message.submitButtonId, message.confirmButtonIds);
				sendResponse({ success: true });
				break;

			default:
				sendResponse({ error: "Unknown message type: " + message.type });
		}
	} catch (error) {
		console.error("[NPTEL Solver] Error:", error);
		sendResponse({ error: error.message });
	}

	return true; // Keep channel open
});

// Extract the assignment HTML for Gemini to parse
function extractPageHTML() {
	console.log("[NPTEL Solver] Extracting page HTML...");

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
			console.log("[NPTEL Solver] Found container:", selector);
			html = container.outerHTML;
			break;
		}
	}

	// Fallback: get entire body if no container found
	if (!html) {
		console.log("[NPTEL Solver] No container found, using body");
		const main =
			document.querySelector("main") ||
			document.querySelector("#main-content") ||
			document.querySelector(".content") ||
			document.body;
		html = main.outerHTML;
		container = main;
	}

	// Extract images from the container
	const images = extractImages(container || document.body);

	// Find submit button
	const submitButton =
		document.querySelector("#submitbutton") ||
		document.querySelector('button[type="submit"]') ||
		document.querySelector(".submit-button") ||
		document.querySelector('[onclick*="submit"]');

	const submitButtonId = submitButton?.id || "submitbutton";
	console.log("[NPTEL Solver] Submit button ID:", submitButtonId);

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
}

// Extract images and convert to base64
function extractImages(container) {
	const images = [];
	const imgElements = container.querySelectorAll("img");

	console.log("[NPTEL Solver] Found", imgElements.length, "images");

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
					console.log("[NPTEL Solver] Cannot convert image (CORS):", img.src);
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

				console.log(
					"[NPTEL Solver] Extracted image:",
					questionId,
					img.naturalWidth + "x" + img.naturalHeight,
				);
			}
		} catch (error) {
			console.warn("[NPTEL Solver] Error extracting image:", error);
		}
	}

	return images;
}

// Apply user answers to the page
function applyAnswers(answers) {
	console.log("[NPTEL Solver] Applying answers:", answers?.length);

	if (!answers || !Array.isArray(answers)) {
		console.error("[NPTEL Solver] Invalid answers array");
		return;
	}

	for (const answer of answers) {
		try {
			switch (answer.question_type) {
				case "single_choice":
					applySingleChoice(answer);
					break;
				case "multi_choice":
					applyMultiChoice(answer);
					break;
				case "fill_blank":
					applyFillBlank(answer);
					break;
				default:
					console.warn(
						"[NPTEL Solver] Unknown question type:",
						answer.question_type,
					);
			}
		} catch (error) {
			console.error("[NPTEL Solver] Error applying answer:", error);
		}
	}
}

// Apply single choice (radio button) answer
function applySingleChoice(answer) {
	const optionId = answer.answer_option_id;
	if (!optionId) {
		console.warn("[NPTEL Solver] No option ID for single choice");
		return;
	}

	console.log("[NPTEL Solver] Applying single choice:", optionId);

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
		element = document.querySelector(`input[type="radio"][id*="${optionId}"]`);
	}

	if (element) {
		element.click();
		element.dispatchEvent(new Event("change", { bubbles: true }));
		console.log("[NPTEL Solver] Clicked radio:", element.id);
	} else {
		console.warn("[NPTEL Solver] Radio not found:", optionId);
	}
}

// Apply multi choice (checkbox) answers
function applyMultiChoice(answer) {
	const optionIds = Array.isArray(answer.answer_option_id)
		? answer.answer_option_id
		: [answer.answer_option_id];

	console.log("[NPTEL Solver] Applying multi choice:", optionIds);

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
			console.log("[NPTEL Solver] Clicked checkbox:", element.id);
		}
	}
}

// Apply fill in the blank answer
function applyFillBlank(answer) {
	const inputId = answer.answer_option_id;
	const text = answer.answer_text;

	console.log("[NPTEL Solver] Applying fill blank:", inputId, text);

	if (!text) {
		console.warn("[NPTEL Solver] No text for fill blank");
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
		console.log("[NPTEL Solver] Filled input:", input.id);
	} else {
		console.warn("[NPTEL Solver] Input not found:", inputId);
	}
}

// Submit the assignment
function submitAssignment(submitButtonId, confirmButtonIds) {
	console.log("[NPTEL Solver] Submitting...");

	const submitButton =
		document.getElementById(submitButtonId) ||
		document.querySelector("#submitbutton") ||
		document.querySelector('button[type="submit"]') ||
		document.querySelector('[onclick*="submit"]');

	if (submitButton) {
		submitButton.click();
		console.log("[NPTEL Solver] Submit clicked");
	} else {
		console.warn("[NPTEL Solver] Submit button not found");
	}
}
