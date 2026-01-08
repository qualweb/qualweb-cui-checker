// flag to indicate that the content script has loaded -- NEEDS to load first to avoid multiple injections
(window as any).__qwContentLoaded = true;

import { processErrorEventCallbackContent } from '../errors/content/error.handler.content';
import { ActionDoesNotExistError } from '../errors/content/errors.class.content';
import { HANDLERS, IChromeRequest } from './handlers';

if (!chrome.runtime.onMessage.hasListener(handleMessagesContentScript)) {
  chrome.runtime.onMessage.addListener(handleMessagesContentScript);
}
console.log('Content script message listener initialized.');

function handleMessagesContentScript(request, sender, sendResponse) {
  try {
    let action = request.action;
    if (!action) throw new ActionDoesNotExistError('No action specified');

    let data: IChromeRequest = { request, sendResponse };

    if (HANDLERS[action]) {
      const handlerFunction = HANDLERS[action](data);

      if (handlerFunction instanceof Promise) {
        handlerFunction
          .then((response) => {
            if (response) sendResponse(response);
          })
          .catch((error) => {
            processErrorEventCallbackContent(error as Error, { sendResponse });
          });

        return true;
      }
      return false;
    }
  } catch (error) {
    processErrorEventCallbackContent(error as Error, { sendResponse });
    return false; 
  }
}
// Function to send message to background
export function sendMessageToBackground(action: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, text }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}
