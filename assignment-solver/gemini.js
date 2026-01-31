// Gemini API Integration for NPTEL Assignment Solver
// One-click auto-solve with multimodal support (text + images)

const Gemini = {
	MODEL: "gemini-2.5-pro",

	// Schema for extracting questions with answers
	EXTRACTION_WITH_ANSWERS_SCHEMA: {
		type: "object",
		properties: {
			submit_button_id: { type: "string" },
			confirm_submit_button_ids: {
				type: "object",
				properties: {
					not_all_attempt_submit: { type: "string" },
					not_all_attempt_cancel: { type: "string" },
					no_attempt_ok: { type: "string" },
				},
			},
			questions: {
				type: "array",
				items: {
					type: "object",
					properties: {
						question_id: { type: "string" },
						question_type: {
							type: "string",
							enum: ["single_choice", "multi_choice", "fill_blank"],
						},
						question: { type: "string" },
						choices: {
							type: "array",
							items: {
								type: "object",
								properties: {
									option_id: { type: "string" },
									text: { type: "string" },
								},
								required: ["option_id", "text"],
							},
						},
						inputs: {
							type: "array",
							items: {
								type: "object",
								properties: {
									input_id: { type: "string" },
									input_type: { type: "string" },
								},
								required: ["input_id", "input_type"],
							},
						},
						answer: {
							type: "object",
							properties: {
								answer_text: { type: "string" },
								answer_option_ids: {
									type: "array",
									items: { type: "string" },
								},
								confidence: { type: "string" },
								reasoning: { type: "string" },
							},
							required: ["answer_text", "answer_option_ids"],
						},
					},
					required: [
						"question_id",
						"question_type",
						"question",
						"choices",
						"inputs",
						"answer",
					],
				},
			},
		},
		required: ["submit_button_id", "questions"],
	},

	// Extract questions AND get answers in one call (with images and screenshots)
	async extractAndAnswer(
		apiKey,
		htmlContent,
		pageInfo,
		images = [],
		screenshots = [],
	) {
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
			console.log(
				"[Gemini] Including",
				screenshots.length,
				"full-page screenshots",
			);

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
			console.log("[Gemini] Including", images.length, "embedded images");

			parts.push({
				text: "Additional embedded images from the assignment:",
			});

			for (const img of images) {
				// Skip if image is too large (> 4MB base64 = ~3MB actual)
				if (img.base64.length > 4 * 1024 * 1024) {
					console.log("[Gemini] Skipping large image:", img.id);
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
				responseSchema: this.EXTRACTION_WITH_ANSWERS_SCHEMA,
				temperature: 0.1,
				// Enable thinking for complex reasoning
				thinkingConfig: {
					thinkingBudget: 28192, // Medium-high thinking for assignment solving
				},
			},
		};

		const response = await this.callAPI(apiKey, payload);
		return this.parseResponse(response);
	},

	// Call Gemini API via background script
	async callAPI(apiKey, payload) {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(
				{
					type: "GEMINI_REQUEST",
					apiKey: apiKey,
					payload: payload,
				},
				(response) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else if (response?.error) {
						reject(new Error(response.error));
					} else {
						resolve(response);
					}
				},
			);
		});
	},

	// Parse Gemini response
	parseResponse(response) {
		try {
			const content = response?.candidates?.[0]?.content?.parts?.[0]?.text;
			if (!content) {
				throw new Error("Empty response from Gemini");
			}
			return JSON.parse(content);
		} catch (e) {
			console.error("Failed to parse Gemini response:", e, response);
			throw new Error("Failed to parse Gemini response: " + e.message);
		}
	},
};
