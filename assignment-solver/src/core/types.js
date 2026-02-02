/**
 * @fileoverview Type definitions for the NPTEL Assignment Solver extension
 * These are JSDoc typedefs used for IDE autocomplete and type safety
 */

/**
 * @typedef {Object} Logger
 * @property {(msg: string) => void} log
 * @property {(msg: string) => void} info
 * @property {(msg: string) => void} warn
 * @property {(msg: string) => void} error
 * @property {(msg: string) => void} debug
 */

/**
 * @typedef {Object} Message
 * @property {string} type - Message type identifier
 * @property {any} [payload] - Optional message payload
 */

/**
 * @typedef {Object} ExtractedQuestion
 * @property {string} question_id - Unique question identifier
 * @property {string} question_type - "single_choice", "multi_choice", or "fill_blank"
 * @property {string} question - Question text
 * @property {Array<{option_id: string, text: string}>} choices - Available choices
 * @property {Array<{input_id: string, input_type: string}>} inputs - Input fields
 * @property {Object} answer - Answer object
 * @property {string} answer.answer_text - Answer text
 * @property {Array<string>} answer.answer_option_ids - Selected option IDs
 * @property {string} [answer.confidence] - "high", "medium", or "low"
 * @property {string} [answer.reasoning] - Explanation of the answer
 */

/**
 * @typedef {Object} PageData
 * @property {string} html - Extracted HTML content
 * @property {Array<{id: string, mimeType: string, base64: string, alt: string, width: number, height: number}>} images - Extracted images
 * @property {string} url - Page URL
 * @property {string} title - Page title
 * @property {string} submitButtonId - ID of submit button
 * @property {Object} confirmButtonIds - IDs of confirmation buttons
 * @property {number} [tabId] - Tab ID
 * @property {number} [windowId] - Window ID
 */

/**
 * @typedef {Object} Screenshot
 * @property {string} mimeType - Image MIME type
 * @property {string} base64 - Base64 encoded image
 * @property {number} scrollY - Scroll position
 * @property {number} index - Screenshot index
 * @property {number} total - Total screenshots
 */

/**
 * @typedef {Object} ExtractionResult
 * @property {string} submit_button_id - ID of submit button
 * @property {Object} confirm_submit_button_ids - Confirmation button IDs
 * @property {Array<ExtractedQuestion>} questions - Extracted questions
 */

export {};
