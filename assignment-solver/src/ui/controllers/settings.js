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
			if (elements.solvingModelSelect) {
				elements.solvingModelSelect.value = prefs.solvingModel;
			}
			if (elements.settingsModal) {
				elements.settingsModal.style.display = "flex";
			}
		},

		/**
		 * Hide settings modal
		 */
		hide() {
			log("Hiding settings modal");
			if (elements.settingsModal) {
				elements.settingsModal.style.display = "none";
			}
		},

		/**
		 * Save settings
		 * @returns {Promise<boolean>} True if saved successfully
		 */
		async save() {
			const apiKey = elements.apiKeyInput?.value?.trim();
			const extractionModel = elements.extractionModelSelect?.value;
			const solvingModel = elements.solvingModelSelect?.value;

			if (!apiKey) {
				log("API key not provided");
				return false;
			}

			log("Saving API key and preferences");
			await storage.saveApiKey(apiKey);
			await storage.saveModelPreferences({
				extractionModel: extractionModel || "gemini-2.5-flash",
				solvingModel: solvingModel || "gemini-2.5-pro",
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
