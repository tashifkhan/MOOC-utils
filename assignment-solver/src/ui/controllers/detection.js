/**
 * @fileoverview Assignment detection controller for sidebar UI
 */

import { MESSAGE_TYPES, sendMessageWithRetry } from "../../core/messages.js";

/**
 * Create detection controller
 * @param {Object} deps - Dependencies
 * @param {Object} deps.elements - DOM elements
 * @param {Object} deps.runtime - Runtime adapter
 * @param {Function} [deps.logger] - Optional logger
 * @returns {Object} Detection controller
 */
export function createDetectionController({ elements, runtime, logger = null }) {
	const log = logger?.log || (() => {});

	return {
		/**
		 * Check current page for assignment
		 */
		async checkCurrentPage() {
			try {
				log("Checking current page for assignment...");
				const response = await sendMessageWithRetry(
					runtime,
					{ type: MESSAGE_TYPES.GET_PAGE_INFO },
					{ maxRetries: 3, baseDelay: 200, logger: log },
				);

				if (response?.isAssignment) {
					this.showAssignmentInfo(response);
				} else {
					this.showEmptyState();
				}
			} catch (error) {
				log(`Error checking page: ${error.message}`);
				this.showEmptyState();
			}
		},

		/**
		 * Show assignment info in sidebar
		 * @param {Object} pageInfo - Page information
		 */
		showAssignmentInfo(pageInfo) {
			log("Showing assignment info");

			// Hide empty state
			if (elements.emptyState) {
				elements.emptyState.classList.add("hidden");
			}

			// Show assignment info
			if (elements.assignmentInfo) {
				elements.assignmentInfo.classList.remove("hidden");
			}

			// Update title
			if (elements.assignmentTitle) {
				elements.assignmentTitle.textContent = pageInfo.title || "Assignment";
			}

			// Update question count
			if (elements.questionCount) {
				const count = pageInfo.questionCount || 0;
				elements.questionCount.textContent = `${count} question${count !== 1 ? "s" : ""} detected`;
			}
		},

		/**
		 * Show empty state (no assignment detected)
		 */
		showEmptyState() {
			log("Showing empty state");

			// Show empty state
			if (elements.emptyState) {
				elements.emptyState.classList.remove("hidden");
			}

			// Hide assignment info
			if (elements.assignmentInfo) {
				elements.assignmentInfo.classList.add("hidden");
			}
		},

		/**
		 * Initialize page detection
		 */
		init() {
			log("Initializing detection controller");

			// Check on load
			this.checkCurrentPage();

			// Listen for tab updates from background
			runtime.onMessage?.((message) => {
				if (message.type === "TAB_UPDATED") {
					log("Tab updated, re-checking page...");
					this.checkCurrentPage();
				}
			});
		},
	};
}
