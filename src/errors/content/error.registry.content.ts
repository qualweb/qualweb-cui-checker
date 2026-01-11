import {
  CallbackHandler,
  CallbackMessagingEvent,
  MessageResponse,
  STATUS,
} from '../../messaging/message-types';
import { ERROR_CLASS_NAME_CONTENT } from './errors.class.content';
import { ERROR_MESSAGES_CONTENT } from './errors.definitions.content';

export const DEFAULT_CONTENT_ERROR_SET = new Set<string>([
  ERROR_CLASS_NAME_CONTENT.ACTION_DOES_NOT_EXIST_ERROR,
  ERROR_CLASS_NAME_CONTENT.INTERACTION_IN_PROGRESS_ERROR,
  ERROR_CLASS_NAME_CONTENT.INPUT_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.MICROPHONE_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.DIALOG_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.WINDOW_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.SELECTORS_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR,
  ERROR_CLASS_NAME_CONTENT.ELEMENT_NOT_FOUND_ERROR,
]);

/* Handlers for background callback-based messaging errors */
export const CONTENT_EXCEPTION_CALLBACK_HANDLERS: Record<string, CallbackHandler> = {
  [ERROR_CLASS_NAME_CONTENT.CANCELLATION_ERROR]: {
    handler: (event: CallbackMessagingEvent): boolean => {
      event.sendResponse({
        status: STATUS.SUCCESS,
        message: 'The operation was cancelled by the user.',
      });
      return true;
    },
  },
};
export const DEFAULT_CONTENT_PORT_ERROR_SET = new Set<string>([
  ERROR_CLASS_NAME_CONTENT.OBSERVER_FOUND_NO_MESSAGES_AFTER_RETRY_ERROR,
  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_ACCESSIBLE_ERROR,
  ERROR_CLASS_NAME_CONTENT.VOICE_INPUT_FAILED_ERROR,
  ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR,
  ERROR_CLASS_NAME_CONTENT.ACTION_DOES_NOT_EXIST_ERROR,
  ERROR_CLASS_NAME_CONTENT.INTERACTION_IN_PROGRESS_ERROR,
  ERROR_CLASS_NAME_CONTENT.INPUT_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.MICROPHONE_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.DIALOG_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.WINDOW_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.SELECTORS_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR,
  ERROR_CLASS_NAME_CONTENT.ELEMENT_NOT_FOUND_ERROR,
]);

export function resolveContentPortHandlerBehavior(errorName: string): MessageResponse | null {
  let message = null;
  if (DEFAULT_CONTENT_PORT_ERROR_SET.has(errorName)) {
    message = ERROR_MESSAGES_CONTENT[errorName];
  }
  return message;
}

export function defaultPortsErrorHandler(
  message: MessageResponse,
  port: chrome.runtime.Port,
): boolean {
  port.postMessage(message);
  return true;
}
/* Handlers for content script port-based messaging errors */

export const CONTENT_EXCEPTION_PORT_HANDLERS: Record<
  string,
  { handler: (port: chrome.runtime.Port) => boolean }
> = {
  [ERROR_CLASS_NAME_CONTENT.CANCELLATION_ERROR]: {
    handler: (_: chrome.runtime.Port): boolean => {
      return false;
    },
  },
  [ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR]: {
    handler: (port: chrome.runtime.Port): boolean => {
      port.postMessage({
        action: 'error',
        data: {
          status: STATUS.ERROR,
          message: 'An unknown error occurred in the content script.',
        },
      });
      return true;
    },
  },
};
