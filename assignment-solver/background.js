// Background service worker for NPTEL Assignment Solver
// Handles side panel, message routing, Gemini API calls, and screenshot capture

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
	chrome.sidePanel.open({ tabId: tab.id });
});

// Enable side panel for NPTEL pages
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Inject content script if not already present
async function ensureContentScript(tabId) {
	try {
		// Try to ping the content script
		await chrome.tabs.sendMessage(tabId, { type: "PING" });
		console.log("[Background] Content script already loaded");
		return true;
	} catch (error) {
		console.log("[Background] Content script not loaded, injecting...");
		try {
			await chrome.scripting.executeScript({
				target: { tabId: tabId },
				files: ["content.js"],
			});
			console.log("[Background] Content script injected successfully");
			// Wait a bit for the script to initialize
			await new Promise((r) => setTimeout(r, 100));
			return true;
		} catch (injectError) {
			console.error(
				"[Background] Failed to inject content script:",
				injectError,
			);
			return false;
		}
	}
}

// Message router between content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("[Background] Received message:", message.type);

	if (message.type === "EXTRACT_HTML") {
		// Get active tab and forward to content script
		chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
			console.log("[Background] Active tabs:", tabs);
			if (tabs && tabs[0] && tabs[0].id) {
				const tabId = tabs[0].id;

				// Ensure content script is loaded
				const injected = await ensureContentScript(tabId);
				if (!injected) {
					sendResponse({
						error: "Failed to load content script. Please refresh the page.",
					});
					return;
				}

				// Now send the actual message
				chrome.tabs.sendMessage(
					tabId,
					{ type: "GET_PAGE_HTML" },
					(response) => {
						console.log("[Background] Content script response:", response);
						if (chrome.runtime.lastError) {
							console.error("[Background] Error:", chrome.runtime.lastError);
							sendResponse({
								error:
									chrome.runtime.lastError.message ||
									"Content script not responding. Please refresh the page.",
							});
						} else {
							// Include tabId and windowId in response for screenshot capture
							sendResponse({
								...response,
								tabId: tabId,
								windowId: tabs[0].windowId,
							});
						}
					},
				);
			} else {
				sendResponse({ error: "No active tab found" });
			}
		});
		return true; // Keep channel open for async response
	}

	// Capture full page screenshots by scrolling
	if (message.type === "CAPTURE_FULL_PAGE") {
		const { tabId, windowId } = message;
		captureFullPage(tabId, windowId)
			.then((screenshots) => {
				console.log("[Background] Captured", screenshots.length, "screenshots");
				sendResponse({ screenshots });
			})
			.catch((error) => {
				console.error("[Background] Screenshot error:", error);
				sendResponse({ error: error.message, screenshots: [] });
			});
		return true;
	}

	if (message.type === "APPLY_ANSWERS") {
		chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
			if (tabs && tabs[0] && tabs[0].id) {
				const tabId = tabs[0].id;
				await ensureContentScript(tabId);

				chrome.tabs.sendMessage(tabId, message, (response) => {
					if (chrome.runtime.lastError) {
						sendResponse({ error: chrome.runtime.lastError.message });
					} else {
						sendResponse(response || { success: true });
					}
				});
			} else {
				sendResponse({ error: "No active tab found" });
			}
		});
		return true;
	}

	if (message.type === "SUBMIT_ASSIGNMENT") {
		chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
			if (tabs && tabs[0] && tabs[0].id) {
				const tabId = tabs[0].id;
				await ensureContentScript(tabId);

				chrome.tabs.sendMessage(tabId, message, (response) => {
					if (chrome.runtime.lastError) {
						sendResponse({ error: chrome.runtime.lastError.message });
					} else {
						sendResponse(response || { success: true });
					}
				});
			} else {
				sendResponse({ error: "No active tab found" });
			}
		});
		return true;
	}

	if (message.type === "GEMINI_REQUEST") {
		handleGeminiRequest(message.payload, message.apiKey)
			.then((response) => {
				console.log("[Background] Gemini response received");
				sendResponse(response);
			})
			.catch((error) => {
				console.error("[Background] Gemini error:", error);
				sendResponse({ error: error.message });
			});
		return true;
	}

	return false;
});

// Capture full page by scrolling and capturing each viewport
async function captureFullPage(passedTabId, passedWindowId) {
	console.log("[Background] Starting full page capture...");

	let tabId = passedTabId;
	let windowId = passedWindowId;

	// Fallback: query for active tab if not passed
	if (!tabId) {
		const tabs = await chrome.tabs.query({
			active: true,
			lastFocusedWindow: true,
		});
		if (!tabs || !tabs[0]) {
			console.error("[Background] No active tab found");
			throw new Error("No active tab found");
		}
		tabId = tabs[0].id;
		windowId = tabs[0].windowId;
	}

	console.log("[Background] Using Tab ID:", tabId, "Window ID:", windowId);

	// Get page dimensions using executeScript (more reliable than message passing)
	let scrollInfo;
	try {
		const results = await chrome.scripting.executeScript({
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
		console.log("[Background] Page dimensions:", scrollInfo);
	} catch (e) {
		console.error("[Background] Failed to get scroll info:", e);
		throw new Error("Failed to get page dimensions: " + e.message);
	}

	const { scrollHeight, clientHeight, currentScrollY } = scrollInfo;
	const screenshots = [];

	// Calculate number of screenshots needed
	const numScreenshots = Math.ceil(scrollHeight / clientHeight);
	console.log("[Background] Need", numScreenshots, "screenshots");

	// Limit to max 8 screenshots to avoid API limits
	const maxScreenshots = Math.min(numScreenshots, 8);

	for (let i = 0; i < maxScreenshots; i++) {
		const scrollY = i * clientHeight;

		// Scroll to position using executeScript
		try {
			await chrome.scripting.executeScript({
				target: { tabId: tabId },
				func: (y) => window.scrollTo(0, y),
				args: [scrollY],
			});
		} catch (e) {
			console.error("[Background] Scroll failed:", e);
			continue;
		}

		// Wait for scroll and render
		await new Promise((r) => setTimeout(r, 350));

		try {
			// Capture visible tab
			const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
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
				console.log(
					"[Background] Captured screenshot",
					i + 1,
					"/",
					maxScreenshots,
				);
			}
		} catch (captureError) {
			console.error(
				"[Background] Capture error at scroll",
				scrollY,
				":",
				captureError.message,
			);
			// Continue with remaining screenshots
		}
	}

	// Restore original scroll position
	try {
		await chrome.scripting.executeScript({
			target: { tabId: tabId },
			func: (y) => window.scrollTo(0, y),
			args: [currentScrollY],
		});
	} catch (e) {
		console.warn("[Background] Could not restore scroll position");
	}

	console.log("[Background] Total screenshots captured:", screenshots.length);
	return screenshots;
}

// Centralized Gemini API handler
async function handleGeminiRequest(payload, apiKey) {
	// Use Gemini 2.5 Pro with thinking support
	const model = "gemini-2.5-pro";
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

	console.log("[Background] Calling Gemini API...");

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error?.message || "Gemini API request failed");
	}

	return await response.json();
}
