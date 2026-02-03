/**
 * @fileoverview Solve controller for the main assignment solving flow
 */

import { MESSAGE_TYPES } from "../../core/messages.js";
import { escapeHtml, formatQuestionType } from "../utils.js";

/**
 * Create solve controller
 * @param {Object} deps - Dependencies
 * @param {Object} deps.elements - DOM elements
 * @param {Object} deps.state - State manager
 * @param {Object} deps.storage - Storage service
 * @param {Object} deps.gemini - Gemini service
 * @param {Object} deps.runtime - Runtime adapter
 * @param {Object} deps.progress - Progress controller
 * @param {Object} deps.settings - Settings controller
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Solve controller
 */
export function createSolveController({
	elements,
	state,
	storage,
	gemini,
	runtime,
	progress,
	settings,
	logger = null,
}) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Initialize event listeners
		 */
		initEventListeners() {
			elements.solveBtn?.addEventListener("click", () => this.handleSolve());
		},

		/**
		 * Main solve function
		 */
		async handleSolve() {
			if (state.getIsProcessing()) return;

			const apiKey = await storage.getApiKey();
			const prefs = await storage.getModelPreferences();

			if (!apiKey) {
				progress.setStatus("Please set your API key first", "error");
				settings.show();
				return;
			}

			state.setIsProcessing(true);
			elements.solveBtn.disabled = true;
			progress.showProgress();

			try {
				// Step 1: Extract HTML and capture screenshots
				progress.setStep("extract", "active");
				elements.progressTitle.textContent = "Extracting page content...";
				progress.setStatus("Extracting page...", "loading");

				const pageData = await this.extractPageHTML();
				if (!pageData?.html) {
					throw new Error(
						"Could not extract page. Are you on an NPTEL assignment page?",
					);
				}

				// Capture full-page screenshots
				elements.progressTitle.textContent = "Capturing page screenshots...";
				progress.setStatus("Taking screenshots...", "loading");

				let screenshots = [];
				try {
					const screenshotResult = await this.captureFullPageScreenshots(
						pageData.tabId,
						pageData.windowId,
					);
					screenshots = screenshotResult?.screenshots || [];
					log(`Captured ${screenshots.length} screenshots`);
				} catch (ssError) {
					log(`Screenshot capture failed: ${ssError.message}`);
					// Continue without screenshots
				}

				// Step 2a: Extract questions (Gemini)
				const imageCount = pageData.images?.length || 0;
				const screenshotCount = screenshots.length;
				
				progress.setStatus(`AI extraction (${imageCount} imgs, ${screenshotCount} screens)...`, "loading");
				elements.progressTitle.textContent = `Extracting questions (${prefs.extractionModel})...`;
				progress.setIndeterminate();

				const extraction = await gemini.extract(
					apiKey,
					pageData.html,
					{
						url: pageData.url,
						title: pageData.title,
					},
					pageData.images || [],
					screenshots,
					prefs.extractionModel,
				);

				progress.markStepDone("extract");

				// Step 2b: Solve questions (Gemini)
				progress.setStep("answer", "active");
				elements.progressTitle.textContent = `Solving questions (${prefs.solvingModel})...`;
				progress.setStatus(`AI solving (${imageCount} imgs, ${screenshotCount} screens)...`, "loading");

				const solvedExtraction = await gemini.solve(
					apiKey,
					extraction,
					pageData.images || [],
					screenshots,
					prefs.solvingModel,
				);

				// Merge page info and solved answers
				solvedExtraction.submit_button_id =
					solvedExtraction.submit_button_id ||
					extraction.submit_button_id ||
					pageData.submitButtonId;
				solvedExtraction.confirm_submit_button_ids =
					solvedExtraction.confirm_submit_button_ids ||
					extraction.confirm_submit_button_ids ||
					pageData.confirmButtonIds;

				state.setExtraction(solvedExtraction);

				const questionCount = solvedExtraction.questions?.length || 0;

				// Restore progress bar state
				progress.resetProgress(questionCount);
				progress.setProgress(0, questionCount);
				progress.markStepDone("answer");

				// Step 3: Fill answers on page
				progress.setStep("fill", "active");
				elements.progressTitle.textContent = "Filling answers...";
				progress.setStatus("Filling answers...", "loading");

				await this.fillAllAnswers(solvedExtraction.questions);
				progress.markStepDone("fill");

				// Step 4: Submit (if enabled)
				const autoSubmit = elements.autoSubmitCheckbox?.checked;
				if (autoSubmit) {
					progress.setStep("submit", "active");
					elements.progressTitle.textContent = "Submitting...";
					progress.setStatus("Submitting...", "loading");

					await this.submitAssignment(solvedExtraction.submit_button_id);
					progress.markStepDone("submit");
					progress.setStatus("Assignment submitted!");
				} else {
					progress.setStatus("Answers filled - review and submit manually");
				}

				// Show results
				this.showResults(solvedExtraction.questions);
			} catch (error) {
				log(`Solve failed: ${error.message}`);
				progress.setStatus(`Error: ${error.message}`, "error");
				progress.setStep("extract", "error");
			} finally {
				state.setIsProcessing(false);
				elements.solveBtn.disabled = false;
			}
		},

		/**
		 * Extract page HTML via content script
		 * @private
		 * @returns {Promise<PageData>}
		 */
		async extractPageHTML() {
			log("Requesting page extraction...");
			const response = await runtime.sendMessage({
				type: MESSAGE_TYPES.EXTRACT_HTML,
			});

			if (response?.error) {
				throw new Error(response.error);
			}

			log(`HTML extracted, length: ${response?.html?.length}`);
			return response;
		},

		/**
		 * Capture full-page screenshots
		 * @private
		 * @param {number} tabId - Tab ID
		 * @param {number} windowId - Window ID
		 * @returns {Promise<{screenshots: Array<Screenshot>}>}
		 */
		async captureFullPageScreenshots(tabId, windowId) {
			log(`Requesting full-page screenshots for tab: ${tabId}`);
			const response = await runtime.sendMessage({
				type: MESSAGE_TYPES.CAPTURE_FULL_PAGE,
				tabId: tabId,
				windowId: windowId,
			});

			if (response?.error) {
				throw new Error(response.error);
			}

			log(`Captured ${response?.screenshots?.length} screenshots`);
			return response;
		},

		/**
		 * Fill all answers on the page
		 * @private
		 * @param {Array<ExtractedQuestion>} questions - Questions to fill
		 */
		async fillAllAnswers(questions) {
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
				await runtime.sendMessage({
					type: MESSAGE_TYPES.APPLY_ANSWERS,
					answers: [answers[i]],
				});

				progress.setProgress(i + 1, answers.length);
				// Small delay between fills
				await new Promise((r) => setTimeout(r, 100));
			}
		},

		/**
		 * Submit assignment
		 * @private
		 * @param {string} submitButtonId - ID of submit button
		 */
		async submitAssignment(submitButtonId) {
			log("Requesting assignment submission...");
			const response = await runtime.sendMessage({
				type: MESSAGE_TYPES.SUBMIT_ASSIGNMENT,
				submitButtonId: submitButtonId,
			});

			if (response?.error) {
				throw new Error(response.error);
			}
		},

		/**
		 * Show results
		 * @private
		 * @param {Array<ExtractedQuestion>} questions - Questions with answers
		 */
		showResults(questions) {
			log("Showing results...");

			progress.hideProgress();

			if (elements.resultsSection) {
				elements.resultsSection.style.display = "block";
			}

			if (elements.resultsCount) {
				elements.resultsCount.textContent = `${questions.length} questions`;
			}

			let html = "";
			questions.forEach((q, i) => {
				const confidence = q.answer.confidence || "medium";
				const confidenceClass =
					confidence === "high"
						? "high"
						: confidence === "low"
							? "low"
							: "medium";

				html += `
				<div class="result-item">
					<div class="result-header">
						<span class="result-number">Q${i + 1}</span>
						<span class="result-type ${q.question_type}">${formatQuestionType(q.question_type)}</span>
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

			if (elements.resultsList) {
				elements.resultsList.innerHTML = html;
			}
		},
	};
}
