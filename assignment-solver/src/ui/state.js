/**
 * @fileoverview UI state management
 */

/**
 * Create UI state manager
 * @returns {Object} State manager with getters and setters
 */
export function createStateManager() {
	let state = {
		isProcessing: false,
		extraction: null,
		currentStep: null,
	};

	return {
		getIsProcessing: () => state.isProcessing,
		setIsProcessing: (value) => {
			state.isProcessing = value;
		},

		getExtraction: () => state.extraction,
		setExtraction: (value) => {
			state.extraction = value;
		},

		getCurrentStep: () => state.currentStep,
		setCurrentStep: (value) => {
			state.currentStep = value;
		},

		reset: () => {
			state = {
				isProcessing: false,
				extraction: null,
				currentStep: null,
			};
		},
	};
}
