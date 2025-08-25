import { caseHandlers, IChromeRequest } from './actions/MapperActions';

// Main message listener

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let action = request.action;

  if (!action) {
    // error handling
    console.error('Unknown case:', action);
  }
  let data: IChromeRequest = { request, sendResponse };

  if (caseHandlers[action]) {
    const result: any = caseHandlers[action](data);
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
