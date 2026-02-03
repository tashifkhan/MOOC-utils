/**
 * @fileoverview Storage service factory for API key and cache management
 */

/**
 * Create a storage service
 * @param {Object} deps - Dependencies
 * @param {Object} deps.storage - Storage adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Storage service
 */
export function createStorageService({ storage, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		// API Key Management
		async saveApiKey(key) {
			log("Saving API key");
			return storage.set({ geminiApiKey: key });
		},

		async getApiKey() {
			const result = await storage.get("geminiApiKey");
			return result.geminiApiKey || null;
		},

		async removeApiKey() {
			log("Removing API key");
			return storage.remove("geminiApiKey");
		},

		// Extraction Cache
		async saveExtraction(data) {
			const cacheEntry = {
				data: data,
				timestamp: Date.now(),
				url: data.url,
			};
			log("Saving extraction cache");
			return storage.set({ currentExtraction: cacheEntry });
		},

		async getExtraction() {
			const result = await storage.get("currentExtraction");
			return result.currentExtraction?.data || null;
		},

		async clearExtraction() {
			log("Clearing extraction cache");
			return storage.remove("currentExtraction");
		},

		// User Answers
		async saveAnswers(answers) {
			log("Saving user answers");
			return storage.set({ userAnswers: answers });
		},

		async getAnswers() {
			const result = await storage.get("userAnswers");
			return result.userAnswers || {};
		},

		async clearAnswers() {
			log("Clearing user answers");
			return storage.remove("userAnswers");
		},

		// Model Preferences
		async saveModelPreferences(preferences) {
			log("Saving model preferences");
			return storage.set({ modelPreferences: preferences });
		},

		async getModelPreferences() {
			const result = await storage.get("modelPreferences");
			return (
				result.modelPreferences || {
					extractionModel: "gemini-2.5-flash",
					extractionReasoningLevel: "high",
					solvingModel: "gemini-3-pro-preview",
					solvingReasoningLevel: "high",
				}
			);
		},

		// Export formats
		async getFullExtraction() {
			const extraction = await this.getExtraction();
			return extraction || null;
		},

		async getAnswerOnlyExport() {
			const extraction = await this.getExtraction();
			const answers = await this.getAnswers();

			if (!extraction) return null;

			const data = extraction.questions.map((q) => {
				const answer = answers[q.question_id] || {};
				return {
					question_id: q.question_id,
					question: q.question,
					answer_text: answer.answer_text || "",
					answer_option_id:
						answer.answer_option_ids?.length === 1
							? answer.answer_option_ids[0]
							: answer.answer_option_ids || "",
				};
			});

			return {
				submit_button_id: extraction.submit_button_id,
				data: data,
			};
		},
	};
}
