/**
 * @fileoverview UI utilities
 */

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text || "";
	return div.innerHTML;
}

/**
 * Format question type for display
 * @param {string} type - Question type
 * @returns {string} Formatted type
 */
export function formatQuestionType(type) {
	const map = {
		single_choice: "MCQ",
		multi_choice: "MSQ",
		fill_blank: "Fill",
	};
	return map[type] || type;
}
