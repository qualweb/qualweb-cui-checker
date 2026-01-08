import { processErrorEventPortsBackground } from "../../errors/background/error.handler.background";
import { PortsOfCommunication } from "../../messaging/message-types";
import { endInteractionAndCleanup } from "./routers/main-port.router";

export function dispatchCallbackErrorHandler(error: Error,ports:PortsOfCommunication, callback?: () => void): void {
  const shouldInterrupt = processErrorEventPortsBackground(error, ports);
  if (shouldInterrupt) endInteractionAndCleanup();

  if (callback) {
    callback();
  }
}