/**
 * @fileoverview Answer applicator service for content script
 * Applies AI-generated answers to form elements on the page
 */

import { createLogger } from "./logger.js";

/**
 * Create applicator service
 * @returns {Object} Applicator with applyAnswers and submitAssignment methods
 */
export function createApplicator() {
	const logger = createLogger("Applicator");
	const log = logger.log;

	return {
		/**
		 * Apply user answers to the page
		 * @param {Array<Object>} answers - Array of answer objects from AI
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
		 * @param {Object} answer - Answer object with question_id and answer_option_id
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
		 * @param {Object} answer - Answer object with question_id and answer_option_id (array or string)
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
		 * @param {Object} answer - Answer object with question_id, answer_option_id, and answer_text
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
		 * @param {string} submitButtonId - ID of the submit button
		 * @param {Object} confirmButtonIds - IDs of confirmation dialog buttons
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

export default createApplicator;
