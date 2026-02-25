/**
 * @fileoverview Settings controller for API key management
 */

/**
 * Create settings controller
 * @param {Object} deps - Dependencies
 * @param {Object} deps.elements - DOM elements
 * @param {Object} deps.storage - Storage service
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Settings controller
 */
export function createSettingsController({ elements, storage, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Show settings modal
		 */
		async show() {
			log("Showing settings modal");
			const apiKey = await storage.getApiKey();
			const prefs = await storage.getModelPreferences();

			if (elements.apiKeyInput && apiKey) {
				elements.apiKeyInput.value = apiKey;
			}
			if (elements.extractionModelSelect) {
				elements.extractionModelSelect.value = prefs.extractionModel;
			}
			if (elements.extractionReasoningSelect) {
				elements.extractionReasoningSelect.value = prefs.extractionReasoningLevel || "high";
			}
			if (elements.solvingModelSelect) {
				elements.solvingModelSelect.value = prefs.solvingModel;
			}
			if (elements.solvingReasoningSelect) {
				elements.solvingReasoningSelect.value = prefs.solvingReasoningLevel || "high";
			}
			if (elements.settingsModal) {
				elements.settingsModal.classList.remove("hidden");
				// Force reflow for animation
				void elements.settingsModal.offsetWidth;
				elements.settingsModal.classList.remove("opacity-0");
			}
		},

		/**
		 * Hide settings modal
		 */
		hide() {
			log("Hiding settings modal");
			if (elements.settingsModal) {
				elements.settingsModal.classList.add("opacity-0");
				setTimeout(() => {
					elements.settingsModal.classList.add("hidden");
				}, 200);
			}
		},

		/**
		 * Save settings
		 * @returns {Promise<boolean>} True if saved successfully
		 */
		async save() {
			const apiKey = elements.apiKeyInput?.value?.trim();
			const extractionModel = elements.extractionModelSelect?.value;
			const extractionReasoning = elements.extractionReasoningSelect?.value;
			const solvingModel = elements.solvingModelSelect?.value;
			const solvingReasoning = elements.solvingReasoningSelect?.value;

			if (!apiKey) {
				log("API key not provided");
				return false;
			}

			log("Saving API key and preferences");
			await storage.saveApiKey(apiKey);
			await storage.saveModelPreferences({
				extractionModel: extractionModel || "gemini-2.5-flash",
				extractionReasoningLevel: extractionReasoning || "high",
				solvingModel: solvingModel || "gemini-3.1-pro-preview",
				solvingReasoningLevel: solvingReasoning || "high",
			});
			return true;
		},

		/**
		 * Initialize event listeners
		 */
		initEventListeners(callbacks) {
			elements.settingsBtn?.addEventListener("click", () => this.show());
			elements.closeSettingsBtn?.addEventListener("click", () => this.hide());

			elements.saveSettingsBtn?.addEventListener("click", async () => {
				if (await this.save()) {
					callbacks?.onSaved?.();
					this.hide();
				}
			});

			elements.settingsModal?.addEventListener("click", (e) => {
				if (e.target === elements.settingsModal) this.hide();
			});
		},
	};
}
