
import { ChatBotInterface, ResponsesSelectors } from "../utils/types";
import { responses } from "./Interaction";

export const ChecksSelectors: ResponsesSelectors = {
  rules: []
}


export function dispatchEvents(element: HTMLElement) {
  const inputEvent = new Event("input", { bubbles: true });
  element.dispatchEvent(inputEvent);
  setTimeout(() => {
    const keyboardEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
      keyCode: 13,
    });
    element.dispatchEvent(keyboardEvent);
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
  let existingMessages = document.querySelectorAll(selector![0]);
  let response = await observeNewMessages(message, maxWaitTime, chatbotInterface!);

  return response;
}

function startTimeOut(maxWaitTime: number, observer: MutationObserver, callback: () => void): NodeJS.Timeout {
  return setTimeout(() => {
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
  return node.matches(selectorMessage) || node.querySelector(selectorMessage) !== null;
}



export function observeNewMessages(
  messageClient: string,
  maxWaitTime: number,
  chatbotInterface: ChatBotInterface

): Promise<HTMLElement[]> {

  // obtain window of popup
  let element = document.querySelector(chatbotInterface!.selectors.window[0]);

  if (!element) {
    console.error("Windows of chatbot not found, improper selector.");
    return Promise.reject();
  }

  return new Promise(  (resolve) => {
 
    let selectorMessage = chatbotInterface!.selectors.messages[0];
    let responses: HTMLElement[] = [];
    const observer = new MutationObserver((mutations) => {
      // Inicia timeout
      let timeout = startTimeOut(5000, observer, () => resolve(responses));

      let isTyping = false;
      for (const mutation of mutations) {
        // Added nodes
          mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) return;
                
                const element = node as HTMLElement;
              

              if (isNodeTypingInfo(element)) {
                  isTyping = true;
                  stopTimeout(timeout);
                  console.log("Detetado Máquina a escrever Typing:", node);
              
              } else if (isChatBotMessage(element, selectorMessage)) {

                  responses.push(element);

                  if(!isTyping) restartTimeOut(2000, timeout, observer, () => resolve(responses));

                  console.log("added node with textContent:", node.textContent);
              }
          });

          mutation.removedNodes.forEach((node) => {
              if (isNodeTypingInfo(node)) {
                  console.log("Detetado Máquina deixou de escrever Typing:", node);
                  isTyping = false;
                  timeout = startTimeOut(2000, observer, () => resolve(responses));
                  // restartTimeOut(2000, timeout, observer, () => resolve(responses));
              }
          });
      }
  });

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

