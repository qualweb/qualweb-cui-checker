import { ERROR_CLASS_NAME_BACKGROUND } from '../background/errors.class.background';
import { ERROR_CLASS_NAME_CONTENT } from '../content/errors.class.content';
import { ERROR_CLASS_NAME_SIDEPANEL } from './errors.class.sidepanel';

type CombinedErrorNames =
  | (typeof ERROR_CLASS_NAME_CONTENT)[keyof typeof ERROR_CLASS_NAME_CONTENT]
  | (typeof ERROR_CLASS_NAME_BACKGROUND)[keyof typeof ERROR_CLASS_NAME_BACKGROUND]
  | (typeof ERROR_CLASS_NAME_SIDEPANEL)[keyof typeof ERROR_CLASS_NAME_SIDEPANEL];

/**
 * Mapping of error types to user-friendly error messages.
 *
 * Provides clear, non-technical explanations for errors that may occur during
 * chatbot interactions, element verification, accessibility evaluations, and
 * voice input operations. Messages are designed to be easily understood by
 * end-users without exposing implementation details.
 *
 * @constant
 * @type {Record<string, string>}
 */

export const UI_MESSAGE_FRIENDLY_ERRORS: Partial<Record<CombinedErrorNames, string>> = {
  [ERROR_CLASS_NAME_CONTENT.ACTION_DOES_NOT_EXIST_ERROR]: 'The requested action does not exist.',
  [ERROR_CLASS_NAME_CONTENT.ELEMENT_NOT_FOUND_ERROR]:
    'The specified element could not be found on the page.',
  [ERROR_CLASS_NAME_CONTENT.CANCELLATION_ERROR]: 'The operation was cancelled.',
  [ERROR_CLASS_NAME_CONTENT.INTERACTION_IN_PROGRESS_ERROR]:
    'An interaction is already in progress.',
  [ERROR_CLASS_NAME_CONTENT.SELECTORS_NOT_FOUND_ERROR]:
    'The required selectors could not be found.',
  [ERROR_CLASS_NAME_CONTENT.MESSAGE_SELECTOR_NOT_FOUND_ERROR]:
    'The message selector could not be found.',
  [ERROR_CLASS_NAME_CONTENT.WINDOW_NOT_FOUND_ERROR]: 'The window could not be found.',
  [ERROR_CLASS_NAME_CONTENT.INPUT_NOT_FOUND_ERROR]: 'The input element could not be found.',
  [ERROR_CLASS_NAME_CONTENT.MICROPHONE_NOT_FOUND_ERROR]: 'Microphone not found or not accessible.',
  [ERROR_CLASS_NAME_CONTENT.DIALOG_NOT_FOUND_ERROR]: 'The dialog could not be found.',
  [ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_FOUND_ERROR]: 'The iframe could not be found.',
  [ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_ACCESSIBLE_ERROR]: 'The iframe is not accessible.',
  [ERROR_CLASS_NAME_CONTENT.ELEMENT_MANUAL_SELECTION_IN_PROGRESS_ERROR]:
    'Element selection is already in progress.',
  [ERROR_CLASS_NAME_CONTENT.OBSERVER_FOUND_NO_MESSAGES_AFTER_RETRY_ERROR]:
    'No messages found after retry.',
  [ERROR_CLASS_NAME_CONTENT.OBSERVER_RESPONSE_DETECTION_ERROR]: 'Failed to detect response.',
  [ERROR_CLASS_NAME_CONTENT.FAILED_TO_SEND_VOICE_MESSAGE_ERROR]: 'Failed to send voice message.',
  [ERROR_CLASS_NAME_CONTENT.VOICE_INPUT_FAILED_ERROR]: 'Voice input failed.',
  [ERROR_CLASS_NAME_CONTENT.MESSAGE_INSERTION_ERROR]: 'Failed to insert message.',
  [ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR]: 'Unknown content error.',
  [ERROR_CLASS_NAME_CONTENT.CHATBOT_NOT_DETECTED_ERROR]: 'Chatbot could not be detected.',
  [ERROR_CLASS_NAME_CONTENT.NO_INTERACTION_IN_PROGRESS_ERROR]: 'No interaction in progress.',
  [ERROR_CLASS_NAME_CONTENT.NO_ELEMENT_VERIFICATION_IN_PROGRESS_ERROR]:
    'No element verification in progress.',
  [ERROR_CLASS_NAME_CONTENT.INVALID_SELECTOR_PROVIDED_ERROR]: 'Invalid selector provided.',
  [ERROR_CLASS_NAME_CONTENT.WCAG_EVALUATION_ERROR]: 'WCAG evaluation failed.',
  [ERROR_CLASS_NAME_CONTENT.ACT_EVALUATION_ERROR]: 'ACT evaluation failed.',
  [ERROR_CLASS_NAME_CONTENT.CUI_EVALUATION_ERROR]: 'CUI evaluation failed.',
  [ERROR_CLASS_NAME_CONTENT.INSTANCE_NOT_INITIALIZED_ERROR]: 'Instance not initialized.',
  [ERROR_CLASS_NAME_CONTENT.SETTINGS_NOT_FOUND_ERROR]: 'Settings not found.',
  [ERROR_CLASS_NAME_CONTENT.API_KEY_NOT_FOUND_ERROR]: 'API key not found.',
  [ERROR_CLASS_NAME_CONTENT.LOCALE_NOT_FOUND_ERROR]: 'Locale not found.',

  [ERROR_CLASS_NAME_BACKGROUND.CHROME_PORT_DISCONNECTED_ERROR]:
    'Failed to connect to the background script.',
  [ERROR_CLASS_NAME_BACKGROUND.NETWORK_ERROR]: ' Port connection failed.',
  [ERROR_CLASS_NAME_BACKGROUND.LANGGRAPH_AUTHENTICATION_ERROR]:
    'Authentication failed. Please provide valid API key.',

  [ERROR_CLASS_NAME_SIDEPANEL.API_ERROR]: 'A server error occurred while processing your request.',
  [ERROR_CLASS_NAME_SIDEPANEL.API_WITH_DETAILS]:
    'A server error occurred while processing your request.',
  [ERROR_CLASS_NAME_SIDEPANEL.INTERACTION_PORT_CONNECTION]:
    'Failed to connect to the interaction port.',
  [ERROR_CLASS_NAME_SIDEPANEL.INTERACTION_LISTENER_FAILED]:
    'Failed to set up interaction listener.',
  [ERROR_CLASS_NAME_SIDEPANEL.EVALUATION_ERROR]: 'An error occurred during evaluation.',
};
