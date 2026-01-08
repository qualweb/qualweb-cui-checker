import {  SUCCESS_CODE_CONTENT } from "../content/messages";
import { ERROR_CLASS_NAME_BACKGROUND } from "../errors/background/errors.class.background";
import {ERROR_CLASS_NAME_CONTENT} from "../errors/content/errors.class.content";
interface MessageResponseBase {
  data?: any;
}

export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export interface MessageResponseSuccess extends MessageResponseBase {
  status: typeof STATUS.SUCCESS;
  code: keyof typeof SUCCESS_CODE_CONTENT | undefined;
  message?: string;
}

export interface MessageResponseError extends MessageResponseBase {
  status:  typeof STATUS.ERROR;
  code: typeof ERROR_CLASS_NAME_BACKGROUND[keyof typeof ERROR_CLASS_NAME_BACKGROUND] | typeof ERROR_CLASS_NAME_CONTENT[keyof typeof ERROR_CLASS_NAME_CONTENT];
  message: string;
}

export interface PortCommunicationMessage {
    action: string;
    data?: any;
    config?: any;
}
export interface PortsOfCommunication {
    CONTENT?: chrome.runtime.Port;
    SIDEBAR?: chrome.runtime.Port;
}
export interface CallbackMessagingEvent {
    sendResponse: (response: any) => void;
}

export type PortsHandler = {
  handler: (ports: PortsOfCommunication) => boolean;
};
export type CallbackHandler = {
  handler: (sendResponse: CallbackMessagingEvent) => boolean;
};

export type CommunicationHandler = PortsHandler | CallbackHandler;

export type MessageResponse= MessageResponseSuccess | MessageResponseError;