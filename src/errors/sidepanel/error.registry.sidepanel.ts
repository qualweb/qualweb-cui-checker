import { Router } from 'vue-router';
import { MessageResponseError } from '../../messaging/message-types';
import { ERROR_CLASS_NAME_CONTENT } from '../content/errors.class.content';

export interface IErrorHandlerArgs {
  error: Error | MessageResponseError;
  showMessageUI?: Promise<void>;
  callback?: () => void | Promise<void>;
  router: Router;
  storeDispatchCallback?: () => Promise<void>;
}

// Errors that make the sidepanel reset and reset storage selectors
export const CRITICAL_ERRORS_RESET_SELECTORS = new Set<string>([
  ERROR_CLASS_NAME_CONTENT.ELEMENT_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.INPUT_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.WINDOW_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.DIALOG_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.IFRAME_NOT_ACCESSIBLE_ERROR,
  ERROR_CLASS_NAME_CONTENT.SELECTORS_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.MESSAGE_INSERTION_ERROR,
  ERROR_CLASS_NAME_CONTENT.MICROPHONE_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_CONTENT.MESSAGE_SELECTOR_NOT_FOUND_ERROR,
]);

export const SIDEPANEL_EXCEPTION_HANDLERS: Partial<
  Record<string, (args: IErrorHandlerArgs) => Promise<void>>
> = {
  /*ActionDoesNotExistError: (_args) => {
        console.log("Handling ActionDoesNotExistError in side panel");
    },*/
};
