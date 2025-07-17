
import { ChatBotInterface, ResponsesSelectors } from "../../utils/types";

let lastMessageUser: string = '';

export function setLastMessageUser(message:string){
  lastMessageUser = message;
}

export const ChecksSelectors: ResponsesSelectors = {
  rules: []
}


export function dispatchEvents(element: HTMLElement) {
  const inputEvent = new Event("input", { bubbles: true });
  element.dispatchEvent(inputEvent);
  element.focus();

  setTimeout(() => {
    ["keydown", "keypress", "keyup"].forEach((eventType) => {
    const keyboardEvent = new KeyboardEvent(eventType, {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
      keyCode: 13,
    });
    element.dispatchEvent(keyboardEvent);
    }
    );
  }, 100);

}

export async function captureResponse(
  message: string,
  check?: string,
  maxWaitTime = 2000,
  chatbotInterface?: ChatBotInterface
): Promise<HTMLElement[]> {
  const startTime = Date.now();
  let selector = chatbotInterface!.selectors.messages[0];

  // obter mensagens existentes  
  let existingMessages = document.querySelectorAll(selector);
  let response = await observeNewMessages(message, maxWaitTime, chatbotInterface!);

  return response;
}

function startTimeOut(maxWaitTime: number, observer: MutationObserver, callback: () => void): NodeJS.Timeout {
  return setTimeout(() => {
    console.log("Timeout reached, disconnecting observer");
    observer.disconnect();
    callback();
  }, maxWaitTime);
}

function restartTimeOut(maxWaitTime: number, timeout: NodeJS.Timeout, observe: MutationObserver, callback: () => void): NodeJS.Timeout {
  clearTimeout(timeout);
  return startTimeOut(maxWaitTime, observe, callback);
}

function stopTimeout(timeout: NodeJS.Timeout): void {
  clearTimeout(timeout);
}

function isNodeTypingInfo(node: Node): boolean {
  return document.evaluate(
    `boolean(.//*[contains(@*, "typing")] | self::*[contains(@*, "typing")])`,
    node,
    null,
    XPathResult.BOOLEAN_TYPE,
    null
  ).booleanValue;
}

export function isChatBotMessage(node:HTMLElement, selectorMessage:string):boolean {

  if(lastMessageUser){
  let test = ((node.textContent)?.includes(lastMessageUser));
  if(test){
    
    return false;
  } 
  }
  return (node instanceof HTMLElement) && (node.matches(selectorMessage) || node.querySelector(selectorMessage) !== null);
}



export function observeNewMessages(
  messageClient: string,
  maxWaitTime: number,
  chatbotInterface: ChatBotInterface

): Promise<HTMLElement[]> {
  console.log(chatbotInterface);
  // obtain window of popup

  let documentOwner = chatbotInterface!.windowElement!.ownerDocument;
  let element = documentOwner.querySelector(chatbotInterface!.selectors.window[0]);
  console.log(element);

  if (!element) {
    console.error("Windows of chatbot not found, improper selector.");
    return Promise.reject();
  }

  return new Promise(  (resolve) => {
 
    let selectorMessage = chatbotInterface!.messagesSelector;
    let responses: HTMLElement[] = [];
    let timeout: NodeJS.Timeout; 
    const observer = new MutationObserver((mutations) => {
      // Inicia timeout
   

      let isTyping = false;
      for (const mutation of mutations) {
        // Added nodes
          mutation.addedNodes.forEach((node) => {
  
              if (node.nodeType === Node.TEXT_NODE) return;
                
                const element = node as HTMLElement;
              
              // if detected typing
              if (isNodeTypingInfo(element)) {
                  isTyping = true;

                  console.log("A parar o timeout");
                  clearTimeout(timeout);
                  console.log("Timeout stopped" , timeout);
                  console.log("Detetado Máquina a escrever Typing:", node);
              
              } else if (isChatBotMessage(element, selectorMessage)) {

                  responses.push(element);

                  if(!isTyping){
                    console.log("A fazer restart do timeout");
                    restartTimeOut(5000, timeout, observer, () => resolve(responses));
                  } 

                  console.log("added node with textContent:", node.textContent);
              }
          });

          mutation.removedNodes.forEach((node) => {

              if (isNodeTypingInfo(node)) {
                  console.log("Detetado Máquina deixou de escrever Typing:", node);
                  isTyping = false;
                  // start timeout to detect if typing again
                  console.log("Typing of Reiniciar timeout");
                  timeout = startTimeOut(3000, observer, () => resolve(responses));
                  //restartTimeOut(2000, timeout, observer, () => resolve(responses));
              }
          });
      }
  });
    timeout = startTimeOut(5000, observer, () => resolve(responses));
    observer.observe(element, {
      childList: true,
      subtree: true,
    });
    
    waitForObserverDisconnect(observer).then(() =>{
    console.log('Observer Disconnected');
    resolve(responses);
    });  
    

  });
  function waitForObserverDisconnect(observer: MutationObserver): Promise<void> {
    return new Promise<void>((resolve) => {
      const originalDisconnect = observer.disconnect.bind(observer); // Store original disconnect
  
      observer.disconnect = () => {
        originalDisconnect(); 
        resolve(); 
      };
    });
  }
}

