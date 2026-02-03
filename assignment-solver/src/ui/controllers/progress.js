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
				// Update status bar styling based on type
				const dot = elements.statusBar.querySelector(".status-dot");
				
				if (type === "error") {
					elements.statusBar.classList.add("error");
					elements.statusBar.classList.remove("loading");
					if (dot) {
						dot.style.background = "var(--accent-error)";
						dot.style.boxShadow = "0 0 8px var(--accent-error)";
					}
				} else if (type === "loading") {
					elements.statusBar.classList.add("loading");
					elements.statusBar.classList.remove("error");
					if (dot) {
						dot.style.background = "var(--accent-warning)";
						dot.style.boxShadow = "0 0 8px var(--accent-warning)";
					}
				} else {
					elements.statusBar.classList.remove("error", "loading");
					if (dot) {
						dot.style.background = "var(--accent-success)";
						dot.style.boxShadow = "0 0 8px var(--accent-success)";
					}
				}
			}
		},

		/**
		 * Set current step
		 * @param {string} stepName - Step name
		 * @param {string} [status] - Step status (active, done, error)
		 */
		setStep(stepName, status = "active") {
			const steps = elements.progressSteps?.querySelectorAll("[data-step]");
			steps?.forEach((step) => {
				const isTarget = step.dataset.step === stepName;
				if (isTarget) {
					step.dataset.state = status;
				} else {
					step.removeAttribute("data-state");
				}
			});
		},

		/**
		 * Reset all step states
		 */
		resetSteps() {
			const steps = elements.progressSteps?.querySelectorAll("[data-step]");
			steps?.forEach((step) => {
				step.removeAttribute("data-state");
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
			if (step) {
				step.dataset.state = "done";
			}
		},

		/**
		 * Update progress bar
		 * @param {number} current - Current progress
		 * @param {number} total - Total items
		 */
		setProgress(current, total) {
			if (elements.progressCount) {
				elements.progressCount.textContent = `${current}/${total}`;
				elements.progressCount.style.display = "block";
			}
			if (elements.progressFill) {
				elements.progressFill.style.width = `${(current / total) * 100}%`;
				elements.progressFill.classList.remove("animate-pulse");
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
				elements.progressFill.classList.add("animate-pulse");
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
				elements.progressFill.classList.remove("animate-pulse");
				elements.progressFill.style.width = "0%";
			}
		},

		/**
		 * Show progress section
		 */
		showProgress() {
			if (elements.progressSection) {
				elements.progressSection.classList.remove("hidden");
			}
			if (elements.emptyState) {
				elements.emptyState.classList.add("hidden");
				elements.emptyState.classList.remove("flex");
			}
			if (elements.resultsSection) {
				elements.resultsSection.classList.add("hidden");
				elements.resultsSection.classList.remove("flex");
			}
		},

		/**
		 * Hide progress section
		 */
		hideProgress() {
			if (elements.progressSection) {
				elements.progressSection.classList.add("hidden");
			}
		},
	};
}
