/**
 * @fileoverview UI element bindings for the side panel
 */

/**
 * Get all required DOM elements
 * @returns {Object} Object containing all DOM element references
 */
export function getElements() {
	return {
		statusBar: document.getElementById("statusBar"),
		statusText: document.getElementById("statusBar")?.querySelector(".status-text"),
		solveBtn: document.getElementById("solveBtn"),
		autoSubmitCheckbox: document.getElementById("autoSubmitCheckbox"),
		progressSection: document.getElementById("progressSection"),
		progressTitle: document.getElementById("progressTitle"),
		progressCount: document.getElementById("progressCount"),
		progressFill: document.getElementById("progressFill"),
		progressSteps: document.getElementById("progressSteps"),
		resultsSection: document.getElementById("resultsSection"),
		resultsCount: document.getElementById("resultsCount"),
		resultsList: document.getElementById("resultsList"),
		emptyState: document.getElementById("emptyState"),
		// Assignment detection elements
		assignmentInfo: document.getElementById("assignmentInfo"),
		assignmentTitle: document.getElementById("assignmentTitle"),
		questionCount: document.getElementById("questionCount"),
		// Settings elements
		settingsBtn: document.getElementById("settingsBtn"),
		settingsModal: document.getElementById("settingsModal"),
		closeSettingsBtn: document.getElementById("closeSettingsBtn"),
		apiKeyInput: document.getElementById("apiKeyInput"),
		extractionModelSelect: document.getElementById("extractionModelSelect"),
		extractionReasoningSelect: document.getElementById("extractionReasoningSelect"),
		solvingModelSelect: document.getElementById("solvingModelSelect"),
		solvingReasoningSelect: document.getElementById("solvingReasoningSelect"),
		saveSettingsBtn: document.getElementById("saveSettingsBtn"),
		loadingOverlay: document.getElementById("loadingOverlay"),
		loadingText: document.getElementById("loadingText"),
	};
}
