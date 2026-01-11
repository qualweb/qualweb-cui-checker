import { CallbackMessagingEvent, PortsOfCommunication } from "./message-types";
import { PortResponse } from "../background/States";
import { injectScriptsIfAbsent } from "../background/lib/helpers";
import { ContentInjectionError } from "../errors/background/errors.class.background";
import { processErrorEventCallbackBackground } from "../errors/background/error.handler.background";

/** Sends a response through the given port.
 * 
 * @param port  The port to send the response through.
 * @param response  The response to send.
 */
export function sendResponse(port: chrome.runtime.Port, response: PortResponse) {
  port.postMessage(response);
}

/** Sends a message to a specific tab.
 * 
 * @param tabId  The ID of the tab to send the message to.
 * @param request  The message request to send.
 * @param sendResponse    The callback to send the response.
 */
export function sendMessageToTab(tabId: number, request: any,responseHandler: CallbackMessagingEvent,
            callbackOnError:(tabId:number,request:any, responseHandler: CallbackMessagingEvent)=> void): void  {
  
    chrome.tabs.sendMessage(tabId, request, (response) => {
      if (chrome.runtime.lastError) {
        callbackOnError(tabId, request, responseHandler);
      } else {
        responseHandler.sendResponse(response);
      }
    });
  }

/** Tries to reinject content scripts into a tab and retries sending the message.
 *  if reinjection fails, processes the error through the provided response handler.
 * 
 * @param tabId  The ID of the tab to reinject scripts into.
 * @param request  The message request to send.
 * @param responseHandler  The callback to send the response.
 */

export function tryScriptReinjectionAndRetryResponse(
  tabId: number, 
  request: any, 
  responseHandler: CallbackMessagingEvent
): void {
  injectScriptsIfAbsent(tabId)
    .then((injected) => {
      if (injected) {
        
        chrome.tabs.sendMessage(tabId, request, (responseRetry) => { 
          if (chrome.runtime.lastError) {
             processErrorEventCallbackBackground(new ContentInjectionError('Failed to inject content scripts.'), responseHandler);
          } else {
             responseHandler.sendResponse(responseRetry);
          }
        });
      }
    })
    .catch((error) => {
      processErrorEventCallbackBackground(error, responseHandler);
    });
}
export function broadcastMessageOnPorts(ports: PortsOfCommunication, message: any): void {
  if (ports.CONTENT) {
    try {
      ports.CONTENT.postMessage(message);
    } catch (error) {
      console.log('Failed to send message to CONTENT port:', error);
    }
  }

  if (ports.SIDEBAR) {
    try {
      ports.SIDEBAR.postMessage(message);
    } catch (error) {
      console.log('Failed to send message to SIDEBAR port:', error);
    }
  }
}


