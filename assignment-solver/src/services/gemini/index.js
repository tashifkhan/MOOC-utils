/**
 * @fileoverview Gemini service factory for AI-powered assignment solving
 */

import {
	EXTRACTION_WITH_ANSWERS_SCHEMA,
	EXTRACTION_ONLY_SCHEMA,
} from "./schema.js";
import { parseGeminiResponse } from "./parser.js";

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

	/**
	 * Helper to construct content parts
	 */
	function buildContentParts(
		textPrompt,
		htmlContent,
		images = [],
		screenshots = [],
		extractedData = null,
	) {
		const parts = [];

		// Add full-page screenshots first (visual context)
		if (screenshots && screenshots.length > 0) {
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

		// Add the text prompt with content
		let contentText = textPrompt;
		if (htmlContent) {
			contentText += `\n\nHTML Content:\n${htmlContent}`;
		}
		if (extractedData) {
			contentText += `\n\nExtracted Questions:\n${JSON.stringify(extractedData, null, 2)}`;
		}

		parts.push({ text: contentText });

		// Add embedded images from HTML
		if (images && images.length > 0) {
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

		return parts;
	}

	return {
		/**
		 * Extract questions from page
		 * @param {string} apiKey
		 * @param {string} htmlContent
		 * @param {Object} pageInfo
		 * @param {Array} images
		 * @param {Array} screenshots
		 * @param {string} model
		 */
		async extract(
			apiKey,
			htmlContent,
			pageInfo,
			images = [],
			screenshots = [],
			model = "gemini-2.5-flash",
		) {
			const systemPrompt = `You are an expert at parsing NPTEL course assignments.
Your task is to:
1. Parse the HTML to extract all questions with their IDs, types, and options
2. Analyze the provided screenshots to understand the visual layout
3. Return a structured JSON with questions and button IDs

Question types:
- single_choice: Radio buttons
- multi_choice: Checkboxes
- fill_blank: Text input

For each question, extract:
- question_id: Unique ID
- question_type: single_choice | multi_choice | fill_blank
- question: Question text
- choices: Array of {option_id, text} (for MCQ/MSQ)
- inputs: Array of {input_id, input_type} (for fill_blank)

Also extract:
- submit_button_id: ID of submit button
- confirm_submit_button_ids: IDs of confirmation dialog buttons

Return ONLY valid JSON.`;

			const userPrompt = `Extract questions from this NPTEL assignment:
URL: ${pageInfo.url}
Title: ${pageInfo.title}`;

			const parts = buildContentParts(
				userPrompt,
				htmlContent,
				images,
				screenshots,
			);

			const payload = {
				contents: [{ parts }],
				systemInstruction: { parts: [{ text: systemPrompt }] },
				generationConfig: {
					responseMimeType: "application/json",
					responseSchema: EXTRACTION_ONLY_SCHEMA,
					temperature: 0.1,
				},
			};

			log(`Calling Gemini API (extract) with model: ${model}`);
			const response = await this.callAPI(apiKey, payload, model);
			return parseGeminiResponse(response);
		},

		/**
		 * Solve extracted questions
		 * @param {string} apiKey
		 * @param {Object} extractionResult
		 * @param {Array} images
		 * @param {Array} screenshots
		 * @param {string} model
		 */
		async solve(
			apiKey,
			extractionResult,
			images = [],
			screenshots = [],
			model = "gemini-2.5-pro",
		) {
			const systemPrompt = `You are an expert at solving NPTEL course assignments.
Your task is to provide the CORRECT ANSWER for each provided question.

For each question, you MUST provide:
- question_id: The extracted ID
- question_type: The extracted type
- question: The question text
- choices: The extracted choices
- inputs: The extracted inputs
- answer: Object with:
  - answer_option_ids: Array of selected option_id(s)
  - answer_text: The text of the answer
  - confidence: "high", "medium", or "low"
  - reasoning: Brief explanation

IMPORTANT:
- For single_choice: answer_option_ids should have exactly ONE id
- For multi_choice: answer_option_ids should have ALL correct option ids
- For fill_blank: answer_option_ids should contain the input_id, answer_text contains the value to type
- Use the screenshots/images to understand the questions visually (diagrams, equations)

Return ONLY valid JSON.`;

			const userPrompt = `Solve these NPTEL assignment questions:`;

			const parts = buildContentParts(
				userPrompt,
				null,
				images,
				screenshots,
				extractionResult,
			);

			const payload = {
				contents: [{ parts }],
				systemInstruction: { parts: [{ text: systemPrompt }] },
				generationConfig: {
					responseMimeType: "application/json",
					responseSchema: EXTRACTION_WITH_ANSWERS_SCHEMA,
					temperature: 0.1,
					// Only use thinking for pro/flash-thinking models if supported
					thinkingConfig: model.includes("thinking")
						? { thinkingBudget: 28192 }
						: undefined,
				},
			};

			log(`Calling Gemini API (solve) with model: ${model}`);
			const response = await this.callAPI(apiKey, payload, model);
			return parseGeminiResponse(response);
		},

		/**
		 * Call Gemini API via background worker
		 */
		async callAPI(apiKey, payload, model) {
			const response = await runtime.sendMessage({
				type: "GEMINI_REQUEST",
				apiKey: apiKey,
				payload: payload,
				model: model,
			});

			if (response?.error) {
				throw new Error(response.error);
			}

			return response;
		},

		/**
		 * Direct API call (for background worker only)
		 */
		async directAPICall(apiKey, payload, model) {
			const url = `${API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

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
