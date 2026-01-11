export const ERROR_CLASS_NAME_BACKGROUND = {
  LANGGRAPH_AUTHENTICATION_ERROR: 'LanggraphAuthenticationError',
  LANGGRAPH_BUILD_ERROR: 'LanggraphBuildError',
  ACTION_DOES_NOT_EXIST_ERROR: 'ActionDoesNotExistError',
  API_LIMIT_EXCEEDED_ERROR: 'APILimitExceededError',
  NETWORK_ERROR: 'NetworkError',
  CHROME_PORT_DISCONNECTED_ERROR: 'ChromePortDisconnectedError',
  UNKNOWN_ERROR: 'UnknownError',
  GRAPH_RECURSION_LIMIT_ERROR: 'GraphRecursionLimitError',
  INVALID_CHAT_HISTORY_ERROR: 'InvalidChatHistoryError',
  INVALID_CONCURRENT_GRAPH_UPDATE_ERROR: 'InvalidConcurrentGraphUpdateError',
  INVALID_GRAPH_NODE_RETURN_VALUE_ERROR: 'InvalidGraphNodeReturnValueError',
  INVALID_PROMPT_INPUT_ERROR: 'InvalidPromptInputError',
  INVALID_TOOL_RESULTS_ERROR: 'InvalidToolResultsError',
  MESSAGE_COERCION_FAILURE_ERROR: 'MessageCoercionFailureError',
  MISSING_CHECKPOINTER_ERROR: 'MissingCheckpointerError',
  MODEL_AUTHENTICATION_ERROR: 'ModelAuthenticationError',
  MODEL_NOT_FOUND_ERROR: 'ModelNotFoundError',
  MODEL_RATE_LIMIT_ERROR: 'ModelRateLimitError',
  MULTIPLE_SUBGRAPHS_ERROR: 'MultipleSubgraphsError',
  OUTPUT_PARSING_FAILURE_ERROR: 'OutputParsingFailureError',
  UNKNOWN_LANG_GRAPH_ERROR: 'UnknownLangGraphError',
  CONTENT_INJECTION_ERROR: 'ContentInjectionError',
  MUTEX_LOCKED_ERROR: 'MutexLockedError',
  TAB_NOT_ACTIVE_ERROR: 'TabNotActiveError',
  CANCELLATION_ERROR: 'CancellationError',
  INTERACTION_IN_PROGRESS_ERROR: 'InteractionInProgressError',
} as const;

export class LanggraphAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.LANGGRAPH_AUTHENTICATION_ERROR;
  }
}
export class LanggraphBuildError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.LANGGRAPH_BUILD_ERROR;
  }
}
export class APILimitExceededError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.API_LIMIT_EXCEEDED_ERROR;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.NETWORK_ERROR;
  }
}

export class ChromePortDisconnectedError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.CHROME_PORT_DISCONNECTED_ERROR;
  }
}

export class UnknownError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_ERROR;
  }
}

export class GraphRecursionLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.GRAPH_RECURSION_LIMIT_ERROR;
  }
}

export class InvalidChatHistoryError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.INVALID_CHAT_HISTORY_ERROR;
  }
}

export class InvalidConcurrentGraphUpdateError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.INVALID_CONCURRENT_GRAPH_UPDATE_ERROR;
  }
}

export class InvalidGraphNodeReturnValueError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.INVALID_GRAPH_NODE_RETURN_VALUE_ERROR;
  }
}

export class InvalidPromptInputError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.INVALID_PROMPT_INPUT_ERROR;
  }
}

export class InvalidToolResultsError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.INVALID_TOOL_RESULTS_ERROR;
  }
}

export class MessageCoercionFailureError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MESSAGE_COERCION_FAILURE_ERROR;
  }
}

export class MissingCheckpointerError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MISSING_CHECKPOINTER_ERROR;
  }
}

export class ModelAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MODEL_AUTHENTICATION_ERROR;
  }
}

export class ModelNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MODEL_NOT_FOUND_ERROR;
  }
}

export class ModelRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MODEL_RATE_LIMIT_ERROR;
  }
}

export class MultipleSubgraphsError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MULTIPLE_SUBGRAPHS_ERROR;
  }
}

export class OutputParsingFailureError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.OUTPUT_PARSING_FAILURE_ERROR;
  }
}

export class UnknownLangGraphError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_LANG_GRAPH_ERROR;
  }
}

export class ContentInjectionError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.CONTENT_INJECTION_ERROR;
  }
}

export class MutexLockedError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.MUTEX_LOCKED_ERROR;
  }
}

export class TabNotActiveError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.TAB_NOT_ACTIVE_ERROR;
  }
}

export class ActionDoesNotExistError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_BACKGROUND.ACTION_DOES_NOT_EXIST_ERROR;
  }
}

export class CancellationError extends Error {
  constructor() {
    super('Execution cancelled');
    this.name = ERROR_CLASS_NAME_BACKGROUND.CANCELLATION_ERROR;
  }
}

export class InteractionInProgressError extends Error {
  constructor() {
    super('Another interaction is already in progress');
    this.name = ERROR_CLASS_NAME_BACKGROUND.INTERACTION_IN_PROGRESS_ERROR;
  }
}
