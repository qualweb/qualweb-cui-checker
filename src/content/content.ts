
import { HANDLERS, IChromeRequest } from './actions/MapperActions';

// flag to indicate that the content script has loaded
(window as any).__qwContentLoaded = true;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let action = request.action;

  if (!action) {
    // error handling
    console.error('Unknown case:', action);
  }
  let data: IChromeRequest = { request, sendResponse };

  if (HANDLERS[action]) {
    const result: any = HANDLERS[action](data);
    if (result instanceof Promise) {
      result.then((response) => {
        sendResponse(response);
        return false;
      });

      return true;
    }
    return false;
  } else {
    console.error('No handler found for action:', action);
  }
});

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
