export const ERROR_CLASS_NAME_SIDEPANEL = {
  API_ERROR: 'APIError',
  API_WITH_DETAILS: 'APIErrorsWithDetails',
  INTERACTION_PORT_CONNECTION: 'InteractionPortConnectionError',
  INTERACTION_LISTENER_FAILED: 'InteractionListenerFailedError',
  EVALUATION_ERROR: 'EvaluationError',
} as const;

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME_SIDEPANEL.API_ERROR;
  }
}

export class APIErrorsWithDetails extends APIError {
  error_number: number;
  constructor(message: string, error_number: number) {
    super(message);
    this.name = ERROR_CLASS_NAME_SIDEPANEL.API_WITH_DETAILS;
    this.error_number = error_number;
  }
}

export class InteractionPortConnectionError extends APIError {
  constructor() {
    super('');
    this.name = ERROR_CLASS_NAME_SIDEPANEL.INTERACTION_PORT_CONNECTION;
  }
}

export class InteractionListenerFailedError extends APIError {
  constructor() {
    super('');
    this.name = ERROR_CLASS_NAME_SIDEPANEL.INTERACTION_LISTENER_FAILED;
  }
}

export class EvaluationError extends APIError {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME_SIDEPANEL.EVALUATION_ERROR;
  }
}
