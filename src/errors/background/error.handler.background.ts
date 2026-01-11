import {
  BACKGROUND_EXCEPTION_CALLBACK_HANDLERS,
  BACKGROUND_EXCEPTION_PORTS_HANDLERS,
  resolveDefaultCallbackBehavior,
  resolveDefaultPortHandlerBehavior,
} from './error.registry.background';
import { ErrorClass } from '..';
import {
  CallbackMessagingEvent,
  MessageResponse,
  PortsOfCommunication,
} from '../../messaging/message-types';

/** Processes an error that occurred during a background callback-based messaging event.
 *  responds appropriately based on the error type.
 *
 * @param error  The error that occurred.
 * @param callback  The messaging event callback to respond to.
 * @return  True if the background should exit processing the request false otherwise.
 */
export function processErrorEventCallbackBackground(
  error: Error,
  callback: CallbackMessagingEvent,
): boolean {
  const errorName = error.name;
  let message = resolveDefaultCallbackBehavior(errorName);

  if (message) return defaultCallbackErrorHandler(message, callback);

  let errorHandler = BACKGROUND_EXCEPTION_CALLBACK_HANDLERS[errorName];
  if (errorHandler) {
    console.log(`${errorName} during interaction workflow:`, error);
  } else {
    errorHandler = BACKGROUND_EXCEPTION_CALLBACK_HANDLERS[ErrorClass.UnknownLangGraphError.name];
    console.log('Unknown error during interaction workflow:', error);
  }

  return errorHandler.handler(callback);
}

/** Processes an error that occurred during a background port-based messaging event.
 * responds appropriately based on the error type.
 *
 * @param error  The error that occurred.
 * @param ports  The ports of communication to respond to.
 * @returns  True if the background should exit processing the request false otherwise.
 */

export function processErrorEventPortsBackground(
  error: Error,
  ports: PortsOfCommunication,
): boolean {
  const errorName = error.name;
  let message = resolveDefaultPortHandlerBehavior(errorName);
  if (message) return defaultPortsErrorHandler(message, ports);

  let errorHandler = BACKGROUND_EXCEPTION_PORTS_HANDLERS[errorName];
  if (errorHandler) {
    console.log(`${errorName} during interaction workflow:`, error);
  } else {
    errorHandler = BACKGROUND_EXCEPTION_PORTS_HANDLERS[ErrorClass.UnknownError.name];
    console.log('Unknown error during interaction workflow:', error);
  }

  return errorHandler.handler(ports);
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
/*
  Default ports error handler
*/
function defaultPortsErrorHandler(message: MessageResponse, ports: PortsOfCommunication): boolean {
  ports.CONTENT?.postMessage(message);
  ports.SIDEBAR?.postMessage(message);
  return true;
}
