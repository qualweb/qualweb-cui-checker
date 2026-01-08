import { CallbackHandler, MessageResponse, PortsHandler, PortsOfCommunication } from "../../messaging/message-types";
import {ErrorClass} from "..";

import { ERROR_MESSAGES_BACKGROUND } from "./errors.definitions.background";
import { ERROR_CLASS_NAME_BACKGROUND } from "./errors.class.background";


export const CALLBACK_DEFAULT_ERRORS_SET = new Set<string>([
  ERROR_CLASS_NAME_BACKGROUND.TAB_NOT_ACTIVE_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.CONTENT_INJECTION_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MUTEX_LOCKED_ERROR
]);

export function resolveDefaultCallbackBehavior(errorName: string): MessageResponse | null {
    let message =null;
    if (CALLBACK_DEFAULT_ERRORS_SET.has(errorName)) {
       message = ERROR_MESSAGES_BACKGROUND[errorName];
    }
    return message;
}



/* Handlers for background callback-based messaging errors */
export const BACKGROUND_EXCEPTION_CALLBACK_HANDLERS: Record<string, CallbackHandler > = {
  /*
    [ErrorClass.TabNotActiveError.name]: {
    handler: (event: CallbackMessagingEvent) => {
        event.sendResponse(ERROR_MESSAGES.TAB_NOT_ACTIVE_ERROR);
        return true;
    }
  },*/
}
export const PORT_DEFAULT_ERRORS_SET = new Set<string>([
  ERROR_CLASS_NAME_BACKGROUND.GRAPH_RECURSION_LIMIT_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.INVALID_CHAT_HISTORY_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.INVALID_CONCURRENT_GRAPH_UPDATE_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.INVALID_GRAPH_NODE_RETURN_VALUE_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.INVALID_PROMPT_INPUT_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.INVALID_TOOL_RESULTS_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MESSAGE_COERCION_FAILURE_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MISSING_CHECKPOINTER_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MODEL_AUTHENTICATION_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MODEL_NOT_FOUND_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MODEL_RATE_LIMIT_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.MULTIPLE_SUBGRAPHS_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.OUTPUT_PARSING_FAILURE_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_LANG_GRAPH_ERROR,
  ERROR_CLASS_NAME_BACKGROUND.UNKNOWN_ERROR
]);

export function resolveDefaultPortHandlerBehavior(errorName: string): MessageResponse | null {
    let message =null;
    if (PORT_DEFAULT_ERRORS_SET.has(errorName)) {
       message = ERROR_MESSAGES_BACKGROUND[errorName];
    }
    return message;
}


/** Handlers for background port-based messaging errors. Custom behavior can be defined
 * 
 */
export const BACKGROUND_EXCEPTION_PORTS_HANDLERS: Record<string, PortsHandler > = {
   [ErrorClass.InteractionInProgressError.name]: {
    handler: (ports:PortsOfCommunication) => {
      const message = ERROR_MESSAGES_BACKGROUND[ERROR_CLASS_NAME_BACKGROUND.INTERACTION_IN_PROGRESS_ERROR];
      ports.SIDEBAR?.postMessage(message);
      return false;
    },
  },

    };
