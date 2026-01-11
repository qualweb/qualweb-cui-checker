import { Router } from 'vue-router';
import { MessageResponseError, STATUS } from '../messaging/message-types';
import {
  CRITICAL_ERRORS_RESET_SELECTORS,
  IErrorHandlerArgs,
  SIDEPANEL_EXCEPTION_HANDLERS,
} from './sidepanel/error.registry.sidepanel';
import { UI_MESSAGE_FRIENDLY_ERRORS } from './sidepanel/errors.definitions.sidepanel';

// Extract the error name from Error instance or Message of Error received
function extractErrorName(args: IErrorHandlerArgs): string {
  let name = '';
  if (args.error instanceof Error) {
    name = args.error.name;
  } else {
    name = args.error.code;
  }
  return name;
}

/** Interceptor o Errors */
export function interceptErrorResponse(result: MessageResponseError, router: Router): boolean {
  if (!result || result.status === STATUS.ERROR) {
    defaultErrorHandler({ error: result, router: router });
    return true;
  }
  return false;
}

export async function handleErrorSidepanel(errorArgs: IErrorHandlerArgs): Promise<void> {
  const name = extractErrorName(errorArgs);
  const customErrorHandler = SIDEPANEL_EXCEPTION_HANDLERS[name];
  if (customErrorHandler) {
    await customErrorHandler(errorArgs);
  } else {
    await defaultErrorHandler(errorArgs);
  }
}

export async function defaultErrorHandler(errorArgs: IErrorHandlerArgs): Promise<void> {
  const { error, storeDispatchCallback, callback, router } = errorArgs;

  const name = extractErrorName(errorArgs);

  if (CRITICAL_ERRORS_RESET_SELECTORS.has(name)) {
    if (storeDispatchCallback) await storeDispatchCallback();
  }

  const messageFriendly = UI_MESSAGE_FRIENDLY_ERRORS[name];
  const baseMessage = error.message || 'An unexpected error occurred.';
  const message = messageFriendly || baseMessage;

  if (callback) await callback();

  router.push({ name: 'error', query: { error: message } });
}
