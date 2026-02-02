/**
 * @fileoverview Progress controller for managing progress display
 */

/**
 * Create progress controller
 * @param {Object} deps - Dependencies
 * @param {Object} deps.elements - DOM elements
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Progress controller
 */
export function createProgressController({ elements, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Update status message
		 * @param {string} message - Status message
		 * @param {string} [type] - Status type (normal, loading, error)
		 */
		setStatus(message, type = "normal") {
			if (elements.statusText) {
				elements.statusText.textContent = message;
			}
			if (elements.statusBar) {
				elements.statusBar.className = `status-bar ${type}`;
			}
		},

		/**
		 * Set current step
		 * @param {string} stepName - Step name
		 * @param {string} [status] - Step status (active, done, error)
		 */
		setStep(stepName, status = "active") {
			const steps = elements.progressSteps?.querySelectorAll(".step");
			steps?.forEach((step) => {
				const isTarget = step.dataset.step === stepName;
				step.classList.remove("active", "done", "error");
				if (status === "done" && isTarget) {
					step.classList.add("done");
				} else if (status === "active" && isTarget) {
					step.classList.add("active");
				} else if (status === "error" && isTarget) {
					step.classList.add("error");
				}
			});
		},

		/**
		 * Mark step as done
		 * @param {string} stepName - Step name
		 */
		markStepDone(stepName) {
			const step = elements.progressSteps?.querySelector(
				`[data-step="${stepName}"]`,
			);
			step?.classList.remove("active");
			step?.classList.add("done");
		},

		/**
		 * Update progress bar
		 * @param {number} current - Current progress
		 * @param {number} total - Total items
		 */
		setProgress(current, total) {
			if (elements.progressCount) {
				elements.progressCount.textContent = `${current}/${total}`;
			}
			if (elements.progressFill) {
				elements.progressFill.style.width = `${(current / total) * 100}%`;
			}
		},

		/**
		 * Set indeterminate progress
		 */
		setIndeterminate() {
			if (elements.progressCount) {
				elements.progressCount.style.display = "none";
			}
			if (elements.progressFill) {
				elements.progressFill.style.width = "100%";
				elements.progressFill.classList.add("indeterminate");
			}
		},

		/**
		 * Reset progress bar
		 * @param {number} total - Total items
		 */
		resetProgress(total) {
			if (elements.progressCount) {
				elements.progressCount.style.display = "block";
				elements.progressCount.textContent = `0/${total}`;
			}
			if (elements.progressFill) {
				elements.progressFill.classList.remove("indeterminate");
				elements.progressFill.style.width = "0%";
			}
		},

		/**
		 * Show progress section
		 */
		showProgress() {
			if (elements.progressSection) {
				elements.progressSection.style.display = "block";
			}
			if (elements.emptyState) {
				elements.emptyState.style.display = "none";
			}
			if (elements.resultsSection) {
				elements.resultsSection.style.display = "none";
			}
		},

		/**
		 * Hide progress section
		 */
		hideProgress() {
			if (elements.progressSection) {
				elements.progressSection.style.display = "none";
			}
		},
	};
}
