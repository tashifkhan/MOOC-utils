// Side Panel Controller for NPTEL Assignment Solver
// One-click auto-solve: Extract → Answer → Fill → Submit

// DOM Elements
const elements = {};

// State
let extraction = null;
let isProcessing = false;

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
	initElements();
	initEventListeners();
	await loadApiKey();
});

function initElements() {
	elements.statusBar = document.getElementById("statusBar");
	elements.statusText = elements.statusBar?.querySelector(".status-text");
	elements.solveBtn = document.getElementById("solveBtn");
	elements.autoSubmitCheckbox = document.getElementById("autoSubmitCheckbox");
	elements.progressSection = document.getElementById("progressSection");
	elements.progressTitle = document.getElementById("progressTitle");
	elements.progressCount = document.getElementById("progressCount");
	elements.progressFill = document.getElementById("progressFill");
	elements.progressSteps = document.getElementById("progressSteps");
	elements.resultsSection = document.getElementById("resultsSection");
	elements.resultsCount = document.getElementById("resultsCount");
	elements.resultsList = document.getElementById("resultsList");
	elements.emptyState = document.getElementById("emptyState");
	elements.settingsBtn = document.getElementById("settingsBtn");
	elements.settingsModal = document.getElementById("settingsModal");
	elements.closeSettingsBtn = document.getElementById("closeSettingsBtn");
	elements.apiKeyInput = document.getElementById("apiKeyInput");
	elements.saveSettingsBtn = document.getElementById("saveSettingsBtn");
	elements.loadingOverlay = document.getElementById("loadingOverlay");
	elements.loadingText = document.getElementById("loadingText");
}

function initEventListeners() {
	elements.solveBtn?.addEventListener("click", handleSolve);
	elements.settingsBtn?.addEventListener("click", showSettings);
	elements.closeSettingsBtn?.addEventListener("click", hideSettings);
	elements.saveSettingsBtn?.addEventListener("click", saveSettings);

	elements.settingsModal?.addEventListener("click", (e) => {
		if (e.target === elements.settingsModal) hideSettings();
	});
}

async function loadApiKey() {
	const apiKey = await Storage.getApiKey();
	if (apiKey && elements.apiKeyInput) {
		elements.apiKeyInput.value = apiKey;
	}
}

// Status updates
function setStatus(message, type = "normal") {
	if (elements.statusText) {
		elements.statusText.textContent = message;
	}
	if (elements.statusBar) {
		elements.statusBar.className = `status-bar ${type}`;
	}
}

function setStep(stepName, status = "active") {
	const steps = elements.progressSteps?.querySelectorAll(".step");
	steps?.forEach((step) => {
		const isTarget = step.dataset.step === stepName;
		step.classList.remove("active", "done", "error");
		if (status === "done" && isTarget) {
			step.classList.add("done");
		} else if (status === "active" && isTarget) {
			step.classList.add("active");
		} else if (status === "error" && isTarget) {
			step.classList.add("error");
		}
	});
}

function markStepDone(stepName) {
	const step = elements.progressSteps?.querySelector(
		`[data-step="${stepName}"]`,
	);
	step?.classList.remove("active");
	step?.classList.add("done");
}

function setProgress(current, total) {
	if (elements.progressCount) {
		elements.progressCount.textContent = `${current}/${total}`;
	}
	if (elements.progressFill) {
		elements.progressFill.style.width = `${(current / total) * 100}%`;
	}
}

// Main solve function
async function handleSolve() {
	if (isProcessing) return;

	const apiKey = await Storage.getApiKey();
	if (!apiKey) {
		setStatus("Please set your API key first", "error");
		showSettings();
		return;
	}

	isProcessing = true;
	elements.solveBtn.disabled = true;
	elements.emptyState.style.display = "none";
	elements.resultsSection.style.display = "none";
	elements.progressSection.style.display = "block";

	try {
		// Step 1: Extract HTML and capture screenshots
		setStep("extract", "active");
		elements.progressTitle.textContent = "Extracting page content...";
		setStatus("Extracting page...", "loading");

		const pageData = await extractPageHTML();
		if (!pageData?.html) {
			throw new Error(
				"Could not extract page. Are you on an NPTEL assignment page?",
			);
		}

		// Capture full-page screenshots
		elements.progressTitle.textContent = "Capturing page screenshots...";
		setStatus("Taking screenshots...", "loading");

		let screenshots = [];
		try {
			const screenshotResult = await captureFullPageScreenshots(
				pageData.tabId,
				pageData.windowId,
			);
			screenshots = screenshotResult?.screenshots || [];
			console.log("[SidePanel] Captured", screenshots.length, "screenshots");
		} catch (ssError) {
			console.warn("[SidePanel] Screenshot capture failed:", ssError);
			// Continue without screenshots
		}

		markStepDone("extract");

		// Step 2: Get answers from Gemini
		setStep("answer", "active");
		const imageCount = pageData.images?.length || 0;
		const ssCount = screenshots.length;
		if (ssCount > 0 || imageCount > 0) {
			elements.progressTitle.textContent = `Getting answers from AI (${ssCount} screenshots, ${imageCount} images)...`;
		} else {
			elements.progressTitle.textContent = "Getting answers from AI...";
		}
		setStatus("AI is solving...", "loading");

		extraction = await Gemini.extractAndAnswer(
			apiKey,
			pageData.html,
			{
				url: pageData.url,
				title: pageData.title,
			},
			pageData.images || [],
			screenshots,
		);

		// Merge page info
		extraction.submit_button_id =
			extraction.submit_button_id || pageData.submitButtonId;
		extraction.confirm_submit_button_ids =
			extraction.confirm_submit_button_ids || pageData.confirmButtonIds;

		const questionCount = extraction.questions?.length || 0;
		setProgress(0, questionCount);
		markStepDone("answer");

		// Step 3: Fill answers on page
		setStep("fill", "active");
		elements.progressTitle.textContent = "Filling answers...";
		setStatus("Filling answers...", "loading");

		await fillAllAnswers(extraction.questions);
		markStepDone("fill");

		// Step 4: Submit (if enabled)
		const autoSubmit = elements.autoSubmitCheckbox?.checked;
		if (autoSubmit) {
			setStep("submit", "active");
			elements.progressTitle.textContent = "Submitting...";
			setStatus("Submitting...", "loading");

			await submitAssignment(extraction.submit_button_id);
			markStepDone("submit");
			setStatus("✅ Assignment submitted!");
		} else {
			setStatus("✅ Answers filled - review and submit manually");
		}

		// Show results
		showResults(extraction.questions);
	} catch (error) {
		console.error("Solve failed:", error);
		setStatus(`❌ Error: ${error.message}`, "error");
		setStep("extract", "error");
	} finally {
		isProcessing = false;
		elements.solveBtn.disabled = false;
	}
}

// Extract page HTML via content script
async function extractPageHTML() {
	console.log("[SidePanel] Requesting page extraction...");
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: "EXTRACT_HTML" }, (response) => {
			console.log("[SidePanel] Extraction response:", response);
			if (chrome.runtime.lastError) {
				console.error("[SidePanel] Chrome error:", chrome.runtime.lastError);
				reject(new Error(chrome.runtime.lastError.message));
			} else if (response?.error) {
				console.error("[SidePanel] Response error:", response.error);
				reject(new Error(response.error));
			} else {
				console.log(
					"[SidePanel] HTML extracted, length:",
					response?.html?.length,
				);
				resolve(response);
			}
		});
	});
}

// Capture full-page screenshots by scrolling
async function captureFullPageScreenshots(tabId, windowId) {
	console.log("[SidePanel] Requesting full-page screenshots for tab:", tabId);
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{
				type: "CAPTURE_FULL_PAGE",
				tabId: tabId,
				windowId: windowId,
			},
			(response) => {
				console.log(
					"[SidePanel] Screenshot response:",
					response?.screenshots?.length,
					"screenshots",
				);
				if (chrome.runtime.lastError) {
					console.error(
						"[SidePanel] Screenshot error:",
						chrome.runtime.lastError,
					);
					reject(new Error(chrome.runtime.lastError.message));
				} else if (response?.error) {
					console.error(
						"[SidePanel] Screenshot response error:",
						response.error,
					);
					reject(new Error(response.error));
				} else {
					resolve(response);
				}
			},
		);
	});
}

// Fill all answers on the page
async function fillAllAnswers(questions) {
	const answers = questions.map((q) => ({
		question_id: q.question_id,
		question_type: q.question_type,
		answer_option_id:
			q.answer.answer_option_ids.length === 1
				? q.answer.answer_option_ids[0]
				: q.answer.answer_option_ids,
		answer_text: q.answer.answer_text,
	}));

	// Fill one by one with progress
	for (let i = 0; i < answers.length; i++) {
		await new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				{
					type: "APPLY_ANSWERS",
					answers: [answers[i]],
				},
				(response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(response);
					}
				},
			);
		});

		setProgress(i + 1, answers.length);
		// Small delay between fills
		await new Promise((r) => setTimeout(r, 100));
	}
}

// Submit assignment
async function submitAssignment(submitButtonId) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{
				type: "SUBMIT_ASSIGNMENT",
				submitButtonId: submitButtonId,
			},
			(response) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(response);
				}
			},
		);
	});
}

// Show results
function showResults(questions) {
	elements.progressSection.style.display = "none";
	elements.resultsSection.style.display = "block";
	elements.resultsCount.textContent = `${questions.length} questions`;

	let html = "";
	questions.forEach((q, i) => {
		const confidence = q.answer.confidence || "medium";
		const confidenceClass =
			confidence === "high" ? "high" : confidence === "low" ? "low" : "medium";

		html += `
      <div class="result-item">
        <div class="result-header">
          <span class="result-number">Q${i + 1}</span>
          <span class="result-type ${q.question_type}">${formatType(q.question_type)}</span>
          <span class="result-confidence ${confidenceClass}">${confidence}</span>
        </div>
        <div class="result-question">${escapeHtml(q.question.substring(0, 100))}${q.question.length > 100 ? "..." : ""}</div>
        <div class="result-answer">
          <strong>Answer:</strong> ${escapeHtml(q.answer.answer_text)}
        </div>
        ${q.answer.reasoning ? `<div class="result-reasoning">${escapeHtml(q.answer.reasoning)}</div>` : ""}
      </div>
    `;
	});

	elements.resultsList.innerHTML = html;
}

function formatType(type) {
	const map = {
		single_choice: "MCQ",
		multi_choice: "MSQ",
		fill_blank: "Fill",
	};
	return map[type] || type;
}

// Settings
async function showSettings() {
	const apiKey = await Storage.getApiKey();
	if (elements.apiKeyInput && apiKey) {
		elements.apiKeyInput.value = apiKey;
	}
	if (elements.settingsModal) {
		elements.settingsModal.style.display = "flex";
	}
}

function hideSettings() {
	if (elements.settingsModal) {
		elements.settingsModal.style.display = "none";
	}
}

async function saveSettings() {
	const apiKey = elements.apiKeyInput?.value?.trim();

	if (!apiKey) {
		setStatus("Please enter an API key", "error");
		return;
	}

	await Storage.saveApiKey(apiKey);
	setStatus("API key saved");
	hideSettings();
}

// Utility
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text || "";
	return div.innerHTML;
}
