import { ACTION_HANDLERS } from "../content/action";
import PortCommunication from "./PortCommunication";

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

export function initContentProxy(): void {
  console.log("Background contentProxy initialized.");

  if (!chrome.runtime.onMessage.hasListener(handleProxyMessage)) {
    chrome.runtime.onMessage.addListener(handleProxyMessage);
  }



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'speakText') {
    let locale = request.locale || 'en-US';
    chrome.tts.speak(request.text, {
      lang: locale,
      pitch: 0.5,
      volume: 1.0,

      onEvent: (event) => {
        if (event.type == 'end') {
          sendResponse('Speech complete');
        }
      },
    });

    return true;
  }
  
});

}

const MUTEX_CONTROLLED_ACTIONS = [
  ACTION_HANDLERS.START_LLM_INTERACTION,
  ACTION_HANDLERS.START_LLM_SOUND_INTERACTION
];
function handleProxyMessage(request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {

    let action = request.action;
    
      if (!action) {
        // error handling
        console.log('Unknown case for proxy from background to content script:', action);
        return;
      }
      
      console.log('Received action in background:',JSON.stringify(request));
      if (ACTION_HANDLERS[action]) {
          if(action in MUTEX_CONTROLLED_ACTIONS){
            if(PortCommunication.getInstance().isMutexLocked()){
              console.log("Mutex is locked, rejecting action:",action);
              sendResponse({status:"error", message:"Another interaction is in progress. Only one interaction at a time is allowed."});
              return;
            }
            
              }
        const asyncFlag:boolean = ACTION_HANDLERS[action].asynchronous;
        // send message to conte\nt script
        const tabId = request.tabId;
        console.log("Active Tab Id:",tabId);

        if (tabId !== undefined) {
          if(tabId && request.tabId !== tabId){
            console.log("Tab is not active, ignoring message forwarding:",tabId);
            sendResponse({status:"error", tabId:tabId,message:"Tab is not active"});
            return;
          }

            chrome.tabs.sendMessage(tabId, request, (response) => {
            if (chrome.runtime.lastError) {
                console.warn('Error sending to content script:', chrome.runtime.lastError.message);
            } else {
                console.log('Response from content script:', response);
                sendResponse(response);
            }
            });
        } else {
            console.warn('Could not obtain tabId to forward the message');
        }

         return true;        
      } 
    };