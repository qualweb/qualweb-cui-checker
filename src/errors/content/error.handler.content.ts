import {
  CONTENT_EXCEPTION_PORT_HANDLERS,
  CONTENT_EXCEPTION_CALLBACK_HANDLERS,
  DEFAULT_CONTENT_PORT_ERROR_SET,
  DEFAULT_CONTENT_ERROR_SET,
} from '..';
import { CallbackMessagingEvent, MessageResponse } from '../../messaging/message-types';
import { ERROR_CLASS_NAME_CONTENT } from './errors.class.content';
import { CancellationError } from '../background/errors.class.background';
import { ERROR_MESSAGES_CONTENT } from './errors.definitions.content';

export function resolveContentPortHandlerBehavior(errorName: string): MessageResponse | null {
  let message = null;
  if (DEFAULT_CONTENT_PORT_ERROR_SET.has(errorName)) {
    message = ERROR_MESSAGES_CONTENT[errorName];
  }
  return message;
}
export function defaultContentErrorBehaviorCallbackHandler(
  errorName: string,
): MessageResponse | null {
  let message = null;
  if (DEFAULT_CONTENT_ERROR_SET.has(errorName)) {
    message = ERROR_MESSAGES_CONTENT[errorName];
  }
  return message;
}
export function defaultPortsErrorHandler(
  message: MessageResponse,
  port: chrome.runtime.Port,
): boolean {
  const errorMessage = { action: 'error', data: message };
  port.postMessage(errorMessage);
  return true;
}
/** Processes an error that occurred during a content script port-based messaging event.
 *
 * @param error  The error that occurred.
 * @param port  The port to respond to.
 * @returns  True if the content script should exit processing the request false otherwise.
 */
export function processErrorEventPortContent(error: Error, port: chrome.runtime.Port): boolean {
  if (error instanceof CancellationError) {
    return false;
  }
  const errorName = error.name;

  const defaultMessageHandler = resolveContentPortHandlerBehavior(errorName);

  if (defaultMessageHandler) return defaultPortsErrorHandler(defaultMessageHandler, port);
  let errorHandler = CONTENT_EXCEPTION_PORT_HANDLERS[errorName];
  if (!errorHandler) {
    errorHandler = CONTENT_EXCEPTION_PORT_HANDLERS[ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR];
    console.log('Unknown error during interaction workflow:', error);
  }
  return errorHandler.handler(port);
}

/** Processes an error that occurred during a content script callback-based messaging event.
 *  responds appropriately based on the error type.
 *
 * @param error  The error that occurred.
 * @param callback  The messaging event callback to respond to.
 * @returns  True if the content script should exit processing the request false otherwise.
 */
export function processErrorEventCallbackContent(
  error: Error,
  callback: CallbackMessagingEvent,
): boolean {
  if (error instanceof CancellationError) {
    return false;
  }
  const errorName = error.name;

  if (isGracefulShutdownError(error)) return true;

  let defaultMessageHandler = defaultContentErrorBehaviorCallbackHandler(errorName);

  if (defaultMessageHandler) return defaultCallbackErrorHandler(defaultMessageHandler, callback);

  let errorHandler = CONTENT_EXCEPTION_CALLBACK_HANDLERS[errorName];
  if (errorHandler) {
    console.log(`${errorName} during interaction workflow:`, error);
  } else {
    errorHandler =
      CONTENT_EXCEPTION_CALLBACK_HANDLERS[ERROR_CLASS_NAME_CONTENT.UNKNOWN_CONTENT_ERROR];
    console.log('Unknown error during interaction workflow:', error);
  }

  return errorHandler.handler(callback);
}

/** Default callback error handler
 *
 * @param message
 * @param callback
 * @returns
 */
function defaultCallbackErrorHandler(
  message: MessageResponse,
  callback: CallbackMessagingEvent,
): boolean {
  callback.sendResponse(message);
  return true;
}

export function isGracefulShutdownError(error: any): boolean {
  return error?.name === ERROR_CLASS_NAME_CONTENT.CANCELLATION_ERROR;
}
