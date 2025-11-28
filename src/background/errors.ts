export const ERROR = {
    AUTH_API_ERROR: { status: 'error', message: 'Authentication failed. Please verify your API key and permissions.' },
    UNKNOWN_ERROR: { status: 'error', message: 'An unexpected error occurred. Please try again.' },
    LANGGRAPH_BUILD_ERROR: { status: 'error', message: 'Failed to build Langgraph. Please review your configuration.' },
    INTERACTION_IN_PROGRESS: { status: 'error', message: 'An interaction is already in progress. Please wait for it to complete.' }
};