/**
 * @fileoverview Gemini API response parser utility
 */

/**
 * Parse Gemini API response
 * @param {Object} response - Gemini API response
 * @returns {ExtractionResult} Parsed extraction result
 * @throws {Error} If response cannot be parsed
 */
export function parseGeminiResponse(response) {
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
}
