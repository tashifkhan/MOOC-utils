/**
 * @fileoverview Solve controller for the main assignment solving flow
 */

import { MESSAGE_TYPES, sendMessageWithRetry } from "../../core/messages.js";
import { escapeHtml } from "../utils.js";

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
      progress.resetSteps();

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

        // Pin the target tab so all subsequent messages go to the correct tab
        // even if the user switches to a different tab
        const targetTabId = pageData.tabId;
        log(`Pinned target tab ID: ${targetTabId}`);

        // Capture full-page screenshots
        elements.progressTitle.textContent = "Capturing page screenshots...";
        progress.setStatus("Taking screenshots...", "loading");

        let screenshots = [];
        try {
          const screenshotResult = await this.captureFullPageScreenshots(
            targetTabId,
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

        // Log for debugging
        log(
          `Extracted ${imageCount} images from page, captured ${screenshotCount} screenshots`,
        );

        // Show status with counts (even if 0, so user knows what's happening)
        const statusMsg =
          imageCount > 0 || screenshotCount > 0
            ? `AI extraction (${imageCount} imgs, ${screenshotCount} screens)...`
            : "AI extraction (no images found)...";

        progress.setStatus(statusMsg, "loading");
        elements.progressTitle.textContent = `Extracting questions (${prefs.extractionModel})...`;
        progress.setIndeterminate();

        const extraction = await this.extractWithRecursiveSplit(
          apiKey,
          pageData,
          screenshots,
          prefs,
        );

        progress.markStepDone("extract");
        try {
          await sendMessageWithRetry(
            runtime,
            {
              type: MESSAGE_TYPES.GEMINI_DEBUG,
              tabId: targetTabId,
              stage: "extract",
              payload: extraction,
            },
            { maxRetries: 2, baseDelay: 100, logger: log },
          );
        } catch (debugError) {
          log(`Gemini debug log failed: ${debugError.message}`);
        }

        // Step 2b: Solve questions (Gemini)
        progress.setStep("answer", "active");
        elements.progressTitle.textContent = `Solving questions (${prefs.solvingModel})...`;

        const solveStatusMsg =
          imageCount > 0 || screenshotCount > 0
            ? `AI solving (${imageCount} imgs, ${screenshotCount} screens)...`
            : "AI solving questions...";
        progress.setStatus(solveStatusMsg, "loading");

        const solvedExtraction = await this.solveWithRecursiveSplit(
          apiKey,
          extraction,
          pageData.images || [],
          screenshots,
          prefs,
        );
        try {
          await sendMessageWithRetry(
            runtime,
            {
              type: MESSAGE_TYPES.GEMINI_DEBUG,
              tabId: targetTabId,
              stage: "solve",
              payload: solvedExtraction,
            },
            { maxRetries: 2, baseDelay: 100, logger: log },
          );
        } catch (debugError) {
          log(`Gemini debug log failed: ${debugError.message}`);
        }

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

        await this.fillAllAnswers(solvedExtraction.questions, targetTabId);
        progress.markStepDone("fill");

        // Step 4: Submit (if enabled)
        const autoSubmit = elements.autoSubmitCheckbox?.checked;
        if (autoSubmit) {
          progress.setStep("submit", "active");
          elements.progressTitle.textContent = "Submitting...";
          progress.setStatus("Submitting...", "loading");

          await this.submitAssignment(
            solvedExtraction.submit_button_id,
            targetTabId,
          );
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

        // Relay error to page console for debugging
        try {
          await sendMessageWithRetry(
            runtime,
            {
              type: MESSAGE_TYPES.GEMINI_DEBUG,
              tabId: targetTabId,
              stage: "error",
              payload: { error: error.message, stack: error.stack },
            },
            { maxRetries: 1, baseDelay: 100, logger: log },
          );
        } catch (_) {
          // ignore relay failure
        }
      } finally {
        state.setIsProcessing(false);
        elements.solveBtn.disabled = false;
      }
    },

    /**
     * Extract questions with recursive splitting on max token errors.
     * Splits until extraction succeeds, then merges results.
     * @private
     * @param {string} apiKey
     * @param {Object} pageData - Page data with html, url, title, images
     * @param {Array} screenshots
     * @param {Object} prefs - Model preferences
     * @returns {Promise<Object>} Merged extraction result
     */
    async extractWithRecursiveSplit(apiKey, pageData, screenshots, prefs) {
      const MAX_DEPTH = 6;
      const pageInfo = { url: pageData.url, title: pageData.title };
      const images = pageData.images || [];

      const questionElements = this.findQuestionElements(pageData.html);
      log(`Found ${questionElements.length} question elements in HTML`);

      const attemptExtract = async (htmlChunk, depth) => {
        try {
          progress.setStatus("AI extraction...", "loading");
          const result = await gemini.extract(
            apiKey,
            htmlChunk,
            pageInfo,
            images,
            screenshots,
            prefs.extractionModel,
            prefs.extractionReasoningLevel,
          );
          log(
            `Extraction succeeded: ${result.questions?.length || 0} questions`,
          );
          return result;
        } catch (error) {
          if (!this.isMaxTokenError(error)) {
            throw error;
          }

          if (depth >= MAX_DEPTH) {
            throw new Error(
              "Extraction exceeded max split depth due to MAX_TOKENS",
            );
          }

          log(`Extraction hit MAX_TOKENS, splitting (depth ${depth + 1})...`);
          progress.setStatus(
            "MAX_TOKENS hit, splitting extraction...",
            "loading",
          );

          const chunks = this.splitHtmlForRetry(htmlChunk);
          if (!chunks || chunks.length < 2) {
            throw new Error(
              "MAX_TOKENS during extraction but cannot split further",
            );
          }

          const partResults = [];
          for (let i = 0; i < chunks.length; i++) {
            progress.setStatus(
              `Extracting split part ${i + 1}/${chunks.length}...`,
              "loading",
            );
            const partResult = await attemptExtract(chunks[i], depth + 1);
            partResults.push(partResult);
          }

          const merged = this.mergeExtractions(partResults);
          log(
            `Split extraction merged: ${merged.questions?.length || 0} total questions`,
          );
          return merged;
        }
      };

      return attemptExtract(pageData.html, 0);
    },

    /**
     * Find question elements in HTML for splitting
     * @private
     * @param {string} html - Full page HTML
     * @returns {Array<string>} Array of question element outerHTML strings
     */
    findQuestionElements(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const selectors = [
        ".qt-mc-question",
        ".gcb-assessment-item",
        ".assessment-question",
        '[class*="question"]',
      ];

      let questionElements = [];
      for (const selector of selectors) {
        const found = Array.from(doc.querySelectorAll(selector));
        if (found.length > questionElements.length) {
          questionElements = found;
        }
      }

      return questionElements.map((el) => el.outerHTML);
    },

    /**
     * Identify if an error indicates a MAX_TOKENS response
     * @private
     * @param {Error} error
     * @returns {boolean}
     */
    isMaxTokenError(error) {
      return /MAX_TOKENS/i.test(error?.message || "");
    },

    /**
     * Split HTML for retries: prefer question elements, fallback to length split
     * @private
     * @param {string} html
     * @returns {Array<string>}
     */
    splitHtmlForRetry(html) {
      const elements = this.findQuestionElements(html);
      if (elements.length >= 2) {
        return this.splitIntoChunks(elements, 2);
      }
      return this.splitHtmlByLength(html, 2);
    },

    /**
     * Split question HTML strings into N roughly equal chunks
     * @private
     * @param {Array<string>} questionHtmls - Array of question outerHTML strings
     * @param {number} numChunks - Number of chunks to create
     * @returns {Array<string>} Array of wrapped HTML chunks
     */
    splitIntoChunks(questionHtmls, numChunks) {
      const chunkSize = Math.ceil(questionHtmls.length / numChunks);
      const chunks = [];

      for (let i = 0; i < questionHtmls.length; i += chunkSize) {
        const slice = questionHtmls.slice(i, i + chunkSize);
        chunks.push(`<div class="assignment-chunk">${slice.join("\n")}</div>`);
      }

      return chunks;
    },

    /**
     * Split raw HTML into N chunks by length
     * @private
     * @param {string} html
     * @param {number} numChunks
     * @returns {Array<string>}
     */
    splitHtmlByLength(html, numChunks) {
      const chunkSize = Math.ceil(html.length / numChunks);
      const chunks = [];

      for (let i = 0; i < html.length; i += chunkSize) {
        const slice = html.slice(i, i + chunkSize);
        chunks.push(`<div class="assignment-chunk">${slice}</div>`);
      }

      return chunks;
    },

    /**
     * Split questions into two chunks for solve retries
     * @private
     * @param {Array} questions
     * @returns {Array<Array>}
     */
    splitQuestionsForRetry(questions) {
      if (!questions || questions.length < 2) {
        return [];
      }

      const mid = Math.ceil(questions.length / 2);
      return [questions.slice(0, mid), questions.slice(mid)].filter(
        (chunk) => chunk.length > 0,
      );
    },

    /**
     * Merge multiple extraction results into one
     * @private
     * @param {Array<Object>} results - Array of extraction results
     * @returns {Object} Merged extraction
     */
    mergeExtractions(results) {
      const merged = {
        questions: [],
        submit_button_id: null,
        confirm_submit_button_ids: null,
      };

      const seenQuestionIds = new Set();

      for (const result of results) {
        if (result.questions) {
          for (const question of result.questions) {
            const id = question?.question_id;
            if (id && seenQuestionIds.has(id)) {
              continue;
            }
            if (id) {
              seenQuestionIds.add(id);
            }
            merged.questions.push(question);
          }
        }
        if (!merged.submit_button_id && result.submit_button_id) {
          merged.submit_button_id = result.submit_button_id;
        }
        if (
          !merged.confirm_submit_button_ids &&
          result.confirm_submit_button_ids
        ) {
          merged.confirm_submit_button_ids = result.confirm_submit_button_ids;
        }
      }

      return merged;
    },

    /**
     * Solve questions with recursive splitting on max token errors.
     * Splits question sets until solving succeeds, then merges results.
     * @private
     * @param {string} apiKey
     * @param {Object} extraction - Extraction result with questions array
     * @param {Array} images
     * @param {Array} screenshots
     * @param {Object} prefs - Model preferences
     * @returns {Promise<Object>} Merged solve result
     */
    async solveWithRecursiveSplit(
      apiKey,
      extraction,
      images,
      screenshots,
      prefs,
    ) {
      const MAX_DEPTH = 6;

      const attemptSolve = async (chunkExtraction, depth) => {
        try {
          progress.setStatus("AI solving questions...", "loading");
          const result = await gemini.solve(
            apiKey,
            chunkExtraction,
            images,
            screenshots,
            prefs.solvingModel,
            prefs.solvingReasoningLevel,
          );
          log(`Solve succeeded: ${result.questions?.length || 0} questions`);
          return result;
        } catch (error) {
          if (!this.isMaxTokenError(error)) {
            throw error;
          }

          if (depth >= MAX_DEPTH) {
            throw new Error("Solve exceeded max split depth due to MAX_TOKENS");
          }

          const questions = chunkExtraction.questions || [];
          const questionChunks = this.splitQuestionsForRetry(questions);
          if (!questionChunks || questionChunks.length < 2) {
            throw new Error("MAX_TOKENS during solve but cannot split further");
          }

          log(`Solve hit MAX_TOKENS, splitting (depth ${depth + 1})...`);
          progress.setStatus("MAX_TOKENS hit, splitting solve...", "loading");

          const partResults = [];
          for (let i = 0; i < questionChunks.length; i++) {
            const partExtraction = {
              ...chunkExtraction,
              questions: questionChunks[i],
            };
            progress.setStatus(
              `Solving split part ${i + 1}/${questionChunks.length}...`,
              "loading",
            );
            const partResult = await attemptSolve(partExtraction, depth + 1);
            partResults.push(partResult);
          }

          const merged = this.mergeExtractions(partResults);
          log(
            `Split solve merged: ${merged.questions?.length || 0} total questions`,
          );
          return merged;
        }
      };

      return attemptSolve(extraction, 0);
    },

    /**
     * Split HTML into two parts based on question blocks
     * @deprecated Use extractWithRecursiveSplit instead
     * @private
     * @param {string} html - Full page HTML
     * @returns {{parts: Array<string>, questionCount: number}}
     */
    splitHtmlByQuestions(html) {
      const elements = this.findQuestionElements(html);

      if (elements.length < 2) {
        return { parts: [], questionCount: elements.length };
      }

      const chunks = this.splitIntoChunks(elements, 2);
      return { parts: chunks, questionCount: elements.length };
    },

    /**
     * Extract page HTML via content script
     * @private
     * @returns {Promise<PageData>}
     */
    async extractPageHTML() {
      log("Requesting page extraction...");
      const response = await sendMessageWithRetry(
        runtime,
        { type: MESSAGE_TYPES.EXTRACT_HTML },
        { maxRetries: 3, baseDelay: 200, logger: log },
      );

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
      const response = await sendMessageWithRetry(
        runtime,
        {
          type: MESSAGE_TYPES.CAPTURE_FULL_PAGE,
          tabId: tabId,
          windowId: windowId,
        },
        { maxRetries: 3, baseDelay: 200, logger: log },
      );

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
     * @param {number} [tabId] - Target tab ID
     */
    async fillAllAnswers(questions, tabId) {
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
        await sendMessageWithRetry(
          runtime,
          {
            type: MESSAGE_TYPES.APPLY_ANSWERS,
            tabId: tabId,
            answers: [answers[i]],
          },
          { maxRetries: 2, baseDelay: 100, logger: log },
        );

        progress.setProgress(i + 1, answers.length);
        // Small delay between fills
        await new Promise((r) => setTimeout(r, 100));
      }
    },

    /**
     * Submit assignment
     * @private
     * @param {string} submitButtonId - ID of submit button
     * @param {number} [tabId] - Target tab ID
     */
    async submitAssignment(submitButtonId, tabId) {
      log("Requesting assignment submission...");
      const response = await sendMessageWithRetry(
        runtime,
        {
          type: MESSAGE_TYPES.SUBMIT_ASSIGNMENT,
          tabId: tabId,
          submitButtonId: submitButtonId,
        },
        { maxRetries: 3, baseDelay: 200, logger: log },
      );

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
        elements.resultsSection.classList.remove("hidden");
        elements.resultsSection.classList.add("flex");
      }

      if (elements.resultsCount) {
        elements.resultsCount.textContent = `${questions.length} Qs`;
      }

      const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      /**
       * @param {string} type
       * @returns {string}
       */
      const formatType = (type) => {
        if (type === "single_choice") return "SINGLE CHOICE";
        if (type === "multi_choice") return "MULTI SELECT";
        if (type === "fill_blank") return "FILL IN BLANK";
        return (type || "QUESTION").toUpperCase();
      };

      let html = "";
      questions.forEach((q, i) => {
        const confidence = q.answer.confidence || "medium";
        const confidenceUpper = confidence.toUpperCase();
        const questionText = q.question || "";
        const choices = q.choices || [];
        const answerOptionIds = q.answer.answer_option_ids || [];
        const reasoning = q.answer.reasoning || "";
        const qType = q.question_type || "single_choice";
        const isChoiceType =
          qType === "single_choice" || qType === "multi_choice";

        // ── Choices rows (MCQ / MSQ) ────────────────────────────
        let choicesHtml = "";
        if (isChoiceType && choices.length > 0) {
          const rows = choices
            .map((choice, ci) => {
              const letter = LETTERS[ci] || String(ci + 1);
              const isCorrect = answerOptionIds.includes(choice.option_id);
              return `<div class="result-choice${isCorrect ? " result-choice--correct" : ""}">
                <span class="result-choice-letter">${letter}</span>
                <span class="result-choice-text">${escapeHtml(choice.text)}</span>
                ${isCorrect ? '<span class="result-choice-check">✓</span>' : ""}
              </div>`;
            })
            .join("");
          choicesHtml = `<div class="result-choices">${rows}</div>`;
        }

        // ── Fill-blank answer ───────────────────────────────────
        let fillHtml = "";
        if (!isChoiceType || choices.length === 0) {
          fillHtml = `<div class="result-fill-answer">
            <span class="result-fill-label">ANSWER</span>
            <span class="result-fill-text">${escapeHtml(q.answer.answer_text)}</span>
          </div>`;
        }

        // ── AI Analysis box ─────────────────────────────────────
        let analysisHtml = "";
        if (reasoning) {
          analysisHtml = `<div class="result-analysis">
            <div class="result-analysis-header">
              <span class="result-analysis-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </span>
              <span class="result-analysis-title">AI ANALYSIS</span>
            </div>
            <p class="result-analysis-body">${escapeHtml(reasoning)}</p>
            <div class="result-analysis-tags">
              <span class="result-tag">${confidenceUpper}</span>
              <span class="result-tag">${formatType(qType)}</span>
            </div>
          </div>`;
        }

        html += `<div class="result-item">
          <div class="result-meta">
            <span class="result-meta-type">${formatType(qType)}</span>
            <span class="result-meta-sep">·</span>
            <span class="result-meta-num">Q${i + 1}</span>
            <span class="result-conf result-conf--${confidence}">${confidenceUpper}</span>
          </div>
          <div class="result-question">Q${i + 1}. ${escapeHtml(questionText)}</div>
          ${choicesHtml}
          ${fillHtml}
          ${analysisHtml}
        </div>`;
      });

      if (elements.resultsList) {
        elements.resultsList.innerHTML = html;
      }
    },
  };
}
