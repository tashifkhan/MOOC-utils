// Chrome Storage Utilities for NPTEL Assignment Solver

const Storage = {
	// API Key Management
	async saveApiKey(key) {
		return chrome.storage.local.set({ geminiApiKey: key });
	},

	async getApiKey() {
		const result = await chrome.storage.local.get("geminiApiKey");
		return result.geminiApiKey || null;
	},

	async removeApiKey() {
		return chrome.storage.local.remove("geminiApiKey");
	},

	// Extraction Cache
	async saveExtraction(data) {
		const cacheEntry = {
			data: data,
			timestamp: Date.now(),
			url: data.url,
		};
		return chrome.storage.local.set({ currentExtraction: cacheEntry });
	},

	async getExtraction() {
		const result = await chrome.storage.local.get("currentExtraction");
		return result.currentExtraction?.data || null;
	},

	async clearExtraction() {
		return chrome.storage.local.remove("currentExtraction");
	},

	// User Answers
	async saveAnswers(answers) {
		return chrome.storage.local.set({ userAnswers: answers });
	},

	async getAnswers() {
		const result = await chrome.storage.local.get("userAnswers");
		return result.userAnswers || {};
	},

	async clearAnswers() {
		return chrome.storage.local.remove("userAnswers");
	},

	// Export formats
	async getFullExtraction() {
		const extraction = await this.getExtraction();
		if (!extraction) return null;
		return extraction;
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
