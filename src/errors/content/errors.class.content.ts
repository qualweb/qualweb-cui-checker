export const ERROR_CLASS_NAME_CONTENT = {
  ACTION_DOES_NOT_EXIST_ERROR: 'ActionDoesNotExistError',
  CANCELLATION_ERROR: 'CancellationError',
  INTERACTION_IN_PROGRESS_ERROR: 'InteractionInProgressError',
  SELECTORS_NOT_FOUND_ERROR: 'SelectorsNotFoundError',
  MESSAGE_SELECTOR_NOT_FOUND_ERROR: 'MessageSelectorNotFoundError',
  CHATBOT_BASE_ERROR: 'ChatbotBaseError',
  WINDOW_NOT_FOUND_ERROR: 'WindowNotFoundError',
  INPUT_NOT_FOUND_ERROR: 'InputNotFoundError',
  MICROPHONE_NOT_FOUND_ERROR: 'MicrophoneNotFoundError',
  DIALOG_NOT_FOUND_ERROR: 'DialogNotFoundError',
  IFRAME_NOT_FOUND_ERROR: 'IframeNotFoundError',
  IFRAME_NOT_ACCESSIBLE_ERROR: 'IframeNotAccessibleError',
  ELEMENT_MANUAL_SELECTION_IN_PROGRESS_ERROR: 'ElementManualSelectionInProgressError',
  OBSERVER_FOUND_NO_MESSAGES_AFTER_RETRY_ERROR: 'ObserverFoundNoMessagesAfterRetryError',
  OBSERVER_RESPONSE_DETECTION_ERROR: 'ObserverResponseDetectionError',
  FAILED_TO_SEND_VOICE_MESSAGE_ERROR: 'FailedToSendVoiceMessageError',
  VOICE_INPUT_FAILED_ERROR: 'VoiceInputFailedError',
  MESSAGE_INSERTION_ERROR: 'MessageInsertionError',
  UNKNOWN_CONTENT_ERROR: 'UnknownContentError',
  CHATBOT_NOT_DETECTED_ERROR: 'ChatbotNotDetectedError',
  NO_INTERACTION_IN_PROGRESS_ERROR: 'NoInteractionInProgressError',
  NO_ELEMENT_VERIFICATION_IN_PROGRESS_ERROR: 'NoElementVerificationInProgressError',
  INVALID_SELECTOR_PROVIDED_ERROR: 'InvalidSelectorProvidedError',
  WCAG_EVALUATION_ERROR: 'WCAGEvaluationError',
  ACT_EVALUATION_ERROR: 'ACTEvaluationError',
  CUI_EVALUATION_ERROR: 'CUIEvaluationError',
  INSTANCE_NOT_INITIALIZED_ERROR: 'InstanceNotInitializedError',
  SETTINGS_NOT_FOUND_ERROR: 'SettingsNotFoundError',
  API_KEY_NOT_FOUND_ERROR: 'ApiKeyNotFoundError',
  LOCALE_NOT_FOUND_ERROR: 'LocaleNotFoundError',
  PORT_CONNECTION_ERROR: 'PortConnectionError',
  PORT_INITIAL_CONFIGURATION_ERROR: 'PortInitialConfigurationError',
  FAILED_COMMUNICATION_WITH_BACKGROUND_ERROR: 'FailedCommunicationWithBackgroundError',
  ELEMENT_NOT_FOUND_ERROR: 'ElementNotFoundError',
} as const;




export  class MessageSelectorNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.MESSAGE_SELECTOR_NOT_FOUND_ERROR;
  }
}

export class ElementNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.ELEMENT_NOT_FOUND_ERROR;
  }
}

export class FailedCommunicationWithBackgroundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.FAILED_COMMUNICATION_WITH_BACKGROUND_ERROR;
  }
}
export class PortInitialConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.PORT_INITIAL_CONFIGURATION_ERROR;
  }
}
export class PortConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.PORT_CONNECTION_ERROR;
  }
}
export class SettingsNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.SETTINGS_NOT_FOUND_ERROR;
  }
}

export class ApiKeyNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.API_KEY_NOT_FOUND_ERROR;
  }
}

export class LocaleNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.LOCALE_NOT_FOUND_ERROR;
  }
}

export class NoInteractionInProgressError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.NO_INTERACTION_IN_PROGRESS_ERROR;
  }
}
export class InstanceNotInitializedError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.INSTANCE_NOT_INITIALIZED_ERROR;
  }
}

export class WCAGEvaluationError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.WCAG_EVALUATION_ERROR;
  }
}

export class ACTEvaluationError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.ACT_EVALUATION_ERROR;
  }
}

export class CUIEvaluationError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.CUI_EVALUATION_ERROR;
  }
}

export class IframeNotAccessibleError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_ACCESSIBLE_ERROR;
  }
}

export class NoElementVerificationInProgressError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.NO_ELEMENT_VERIFICATION_IN_PROGRESS_ERROR;
  }
}

export class InvalidSelectorProvidedError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.INVALID_SELECTOR_PROVIDED_ERROR;
  }
}

export class ElementManualSelectionInProgressError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.ELEMENT_MANUAL_SELECTION_IN_PROGRESS_ERROR;
  }
}

export class ChatbotNotDetectedError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.CHATBOT_NOT_DETECTED_ERROR;
  }
}

export class MessageInsertionError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.MESSAGE_INSERTION_ERROR;
  }
}

export class ObserverFoundNoMessagesAfterRetryError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.OBSERVER_FOUND_NO_MESSAGES_AFTER_RETRY_ERROR;
  }
}



export class VoiceInputFailedError extends Error {
  constructor(message) {
    super(message);
    this.name =  ERROR_CLASS_NAME_CONTENT.VOICE_INPUT_FAILED_ERROR;
  }
}

export class ActionDoesNotExistError extends Error {
  constructor(message) {
    super(message);
    this.name = ERROR_CLASS_NAME_CONTENT.ACTION_DOES_NOT_EXIST_ERROR;
  }
}

export class CancellationError extends Error {
  constructor() {
    super('Execution cancelled');
    this.name = ERROR_CLASS_NAME_CONTENT.CANCELLATION_ERROR;
  }
}

export class InteractionInProgressError extends Error {
  constructor() {
    super('Another interaction is already in progress');
    this.name = ERROR_CLASS_NAME_CONTENT.INTERACTION_IN_PROGRESS_ERROR;
  }
}

/** Error classes for Content Script */
export class SelectorsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME_CONTENT.SELECTORS_NOT_FOUND_ERROR;
  }
}
export class ChatbotBaseError extends Error {
  constructor(public message: string, public selector?: string) {
    super(message);
    this.name = ERROR_CLASS_NAME_CONTENT.CHATBOT_BASE_ERROR;
    Object.setPrototypeOf(this, ChatbotBaseError.prototype);
  }
}

// Erros específicos por elemento
export class WindowNotFoundError extends ChatbotBaseError {
  constructor(selector: string) {
    super(`Main Window container not found.`, selector);
    this.name = ERROR_CLASS_NAME_CONTENT.WINDOW_NOT_FOUND_ERROR;
  }
}

export class InputNotFoundError extends ChatbotBaseError {
  constructor(selector: string) {
    super(`Chat input field (input/textarea/div) not found.`, selector);
    this.name = ERROR_CLASS_NAME_CONTENT.INPUT_NOT_FOUND_ERROR;
  }
}

export class MicrophoneNotFoundError extends ChatbotBaseError {
  constructor(selector: string) {
    super(`Microphone element not found.`, selector);
    this.name = ERROR_CLASS_NAME_CONTENT.MICROPHONE_NOT_FOUND_ERROR;
  }
}

export class DialogNotFoundError extends ChatbotBaseError {
  constructor(selector: string) {
    super(`Message dialog container not found.`, selector);
    this.name = ERROR_CLASS_NAME_CONTENT.DIALOG_NOT_FOUND_ERROR;
  }
}

export class IframeNotFoundError extends ChatbotBaseError {
  constructor(selector: string) {
    super(`The chatbot iframe was not found in the DOM.`, selector);
    this.name = ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_FOUND_ERROR;
  }
}

export class UnknownContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR;
  }
}