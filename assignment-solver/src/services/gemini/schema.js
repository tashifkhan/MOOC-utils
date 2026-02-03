/**
 * @fileoverview Gemini API response schema definition
 */

export const EXTRACTION_WITH_ANSWERS_SCHEMA = {
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
};

export const EXTRACTION_ONLY_SCHEMA = {
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
				},
				required: [
					"question_id",
					"question_type",
					"question",
					"choices",
					"inputs",
				],
			},
		},
	},
	required: ["submit_button_id", "questions"],
};
