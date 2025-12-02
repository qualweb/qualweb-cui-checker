
import { HANDLERS, IChromeRequest } from './actions/MapperActions';



if (!chrome.runtime.onMessage.hasListener(handleMessagesContentScript)) {
  chrome.runtime.onMessage.addListener(handleMessagesContentScript);
}

function handleMessagesContentScript(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {

  let action = request.action;

  if (!action) {
    // error handling
    console.log('Unknown case:', action);
    return;
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
    //TODO: Handle unknown action appropriately
    console.log('No handler found for action:', action);
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

// flag to indicate that the content script has loaded
(window as any).__qwContentLoaded = true;
