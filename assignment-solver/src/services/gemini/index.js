/**
 * @fileoverview Gemini service factory for AI-powered assignment solving
 */

import { EXTRACTION_WITH_ANSWERS_SCHEMA } from "./schema.js";
import { parseGeminiResponse } from "./parser.js";

const MODEL = "gemini-2.5-pro";
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Create a Gemini service
 * @param {Object} deps - Dependencies
 * @param {Object} deps.runtime - Runtime adapter for sending messages
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Gemini service
 */
export function createGeminiService({ runtime, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Extract questions and get AI-powered answers
		 * @param {string} apiKey - Gemini API key
		 * @param {string} htmlContent - HTML content of the assignment
		 * @param {Object} pageInfo - Page information
		 * @param {Array<Screenshot>} images - Embedded images
		 * @param {Array<Screenshot>} screenshots - Full-page screenshots
		 * @returns {Promise<ExtractionResult>}
		 */
		async extractAndAnswer(apiKey, htmlContent, pageInfo, images = [], screenshots = []) {
			const systemPrompt = `You are an expert at solving NPTEL course assignments.
Your task is to:
1. Parse the HTML to extract all questions with their IDs, types, and options
2. Analyze the provided full-page screenshots showing the actual rendered assignment
3. Analyze any embedded images (diagrams, equations, figures) in the questions
4. Provide the CORRECT ANSWER for each question

Question types:
- single_choice: Radio buttons - select exactly ONE correct option_id
- multi_choice: Checkboxes - select ALL correct option_ids
- fill_blank: Text input - provide the correct text answer

For each question, you MUST provide:
- question_id: The unique ID from the HTML (id attributes, data-question-id, etc.)
- question_type: Detected from input types
- question: The question text
- choices: Array of {option_id, text} for MCQ/MSQ (empty for fill_blank)
- inputs: Array of {input_id, input_type} for fill_blank (empty for MCQ/MSQ)
- answer: Object with:
  - answer_option_ids: Array of selected option_id(s) for MCQ/MSQ, or [input_id] for fill_blank
  - answer_text: The text of the answer (option text for MCQ, or typed answer for fill_blank)
  - confidence: "high", "medium", or "low"
  - reasoning: Brief explanation of why this is correct

Also extract:
- submit_button_id: ID of the submit button (usually "submitbutton")
- confirm_submit_button_ids: IDs of any confirmation dialog buttons

IMPORTANT: 
- For single_choice: answer_option_ids should have exactly ONE id
- For multi_choice: answer_option_ids should have ALL correct option ids
- For fill_blank: answer_option_ids should contain the input_id, answer_text contains the value to type
- Use BOTH the HTML and screenshots to understand the assignment
- The screenshots show the complete visual layout of all questions

Return ONLY valid JSON. No markdown, no explanations outside the JSON.`;

			// Build content parts with text, screenshots, and images
			const parts = [];

			// Add full-page screenshots first (visual context)
			if (screenshots && screenshots.length > 0) {
				log(`Including ${screenshots.length} full-page screenshots`);

				parts.push({
					text: `Here are ${screenshots.length} screenshots showing the complete assignment page:`,
				});

				for (const ss of screenshots) {
					parts.push({
						inline_data: {
							mime_type: ss.mimeType,
							data: ss.base64,
						},
					});
					parts.push({
						text: `[Screenshot ${ss.index} of ${ss.total}]`,
					});
				}
			}

			// Add the text prompt with HTML
			const userPrompt = `Now extract all questions and provide the correct answers for this NPTEL assignment:

URL: ${pageInfo.url}
Title: ${pageInfo.title}

HTML Content:
${htmlContent}`;

			parts.push({ text: userPrompt });

			// Add embedded images from HTML
			if (images && images.length > 0) {
				log(`Including ${images.length} embedded images`);

				parts.push({
					text: "Additional embedded images from the assignment:",
				});

				for (const img of images) {
					// Skip if image is too large (> 4MB base64 = ~3MB actual)
					if (img.base64.length > 4 * 1024 * 1024) {
						log(`Skipping large image: ${img.id}`);
						continue;
					}

					parts.push({
						inline_data: {
							mime_type: img.mimeType,
							data: img.base64,
						},
					});

					parts.push({
						text: `[Image from: ${img.id}, alt="${img.alt}", size=${img.width}x${img.height}]`,
					});
				}
			}

			const payload = {
				contents: [
					{
						parts: parts,
					},
				],
				systemInstruction: {
					parts: [{ text: systemPrompt }],
				},
				generationConfig: {
					responseMimeType: "application/json",
					responseSchema: EXTRACTION_WITH_ANSWERS_SCHEMA,
					temperature: 0.1,
					thinkingConfig: {
						thinkingBudget: 28192,
					},
				},
			};

			log("Calling Gemini API via runtime adapter");
			const response = await this.callAPI(apiKey, payload);
			return parseGeminiResponse(response);
		},

		/**
		 * Call Gemini API via background worker
		 * @private
		 * @param {string} apiKey - API key
		 * @param {Object} payload - Request payload
		 * @returns {Promise<Object>}
		 */
		async callAPI(apiKey, payload) {
			const response = await runtime.sendMessage({
				type: "GEMINI_REQUEST",
				apiKey: apiKey,
				payload: payload,
			});

			if (response?.error) {
				throw new Error(response.error);
			}

			return response;
		},

		/**
		 * Direct API call (for background worker only)
		 * @internal
		 * @param {string} apiKey - API key
		 * @param {Object} payload - Request payload
		 * @returns {Promise<Object>}
		 */
		async directAPICall(apiKey, payload) {
			const url = `${API_ENDPOINT}/${MODEL}:generateContent?key=${apiKey}`;

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
		},
	};
}
