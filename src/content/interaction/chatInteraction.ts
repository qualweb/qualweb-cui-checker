import { ChatBotInterface, ResponsesSelectors } from '../../utils/types';

let lastMessageUser: string = '';

export function setLastMessageUser(message: string) {
  lastMessageUser = message;
}

export const ChecksSelectors: ResponsesSelectors = {
  rules: [],
};

export function dispatchEvents(element: HTMLElement) {
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
  element.focus();

  setTimeout(() => {
    ['keydown', 'keypress', 'keyup'].forEach((eventType) => {
      const keyboardEvent = new KeyboardEvent(eventType, {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
      });
      element.dispatchEvent(keyboardEvent);
    });
  }, 100);
}

export async function captureResponse(
  message: string,
  check?: string,
  maxWaitTime = 2000,
  chatbotInterface?: ChatBotInterface,
): Promise<HTMLElement[]> {
  let response = await observeNewMessages(message, maxWaitTime, chatbotInterface!);

  return response;
}

function startTimeOut(
  maxWaitTime: number,
  observer: MutationObserver,
  callback: () => void,
): NodeJS.Timeout {
  return setTimeout(() => {
    observer.disconnect();
    callback();
  }, maxWaitTime);
}

function restartTimeOut(
  maxWaitTime: number,
  timeout: NodeJS.Timeout,
  observe: MutationObserver,
  callback: () => void,
): NodeJS.Timeout {
  clearTimeout(timeout);
  return startTimeOut(maxWaitTime, observe, callback);
}

function stopTimeout(timeout: NodeJS.Timeout): void {
  clearTimeout(timeout);
}

function isNodeTypingInfo(node: Node): boolean {
  return document.evaluate(
    `boolean(.//*[contains(@*, "typing")  or contains(@*, "loading") ] | self::*[contains(@*, "typing") or contains(@*, "loading")])`,
    node,
    null,
    XPathResult.BOOLEAN_TYPE,
    null,
  ).booleanValue;
}

export function isChatBotMessage(node: HTMLElement, selectorMessage: string): boolean {
  if (lastMessageUser) {
    let test = node.textContent?.includes(lastMessageUser);
    if (test) {
      return false;
    }
  }
  return (
    node instanceof HTMLElement &&
    (node.matches(selectorMessage) || node.querySelector(selectorMessage) !== null)
  );
}

export function observeNewMessages(
  messageClient: string,
  maxWaitTime: number,
  chatbotInterface: ChatBotInterface,
): Promise<HTMLElement[]> {
  // obtain window of popup

  const documentOwner: Document = chatbotInterface!.windowElement!.ownerDocument;
  const observedNode: Node | null = documentOwner.querySelector(
    chatbotInterface!.selectors.window[0],
  );
  const selectorMessage: string = chatbotInterface!.messagesSelector;
  const existingMessages: Element[] = [...document.querySelectorAll(selectorMessage)];
  let unResolvedDetectedMessages: HTMLElement[] = [];
  let detectedMessages: HTMLElement[] = [];
  const excludedElements: HTMLElement[] = [];
  if (!observedNode) return Promise.reject('Windows of chatbot not found, improper selector.');

  return new Promise((resolve) => {
    let timeout: NodeJS.Timeout;

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      // Inicia timeout
      let isTyping: boolean = false;
      let isDescendentNodeMutation: boolean = false;
      for (const mutation of mutations) {
        let noPreviousSibling: boolean = false;
        let noNextSibling: boolean = false;

        if (mutation.type == 'childList') {
          // // mutations in the child list of descendent Node from main Node ?
          if (mutation.target != observedNode) isDescendentNodeMutation = true;
          // where was inserted
          if (!mutation.nextSibling) noNextSibling = true;
          if (!mutation.previousSibling) noPreviousSibling = true;

          // added Nodes
          for (const addedNode of mutation.addedNodes) {
            // Only allow nodes of type Element
            if (addedNode.nodeType == Node.ELEMENT_NODE) {
              const element: HTMLElement = addedNode as HTMLElement;
              if (isNodeTypingInfo(addedNode as HTMLElement)) {
                // is NodeTypingInfo inside message ?
                console.log('Detected Typing, stopping timeout');
                isTyping = true;
                stopTimeout(timeout);
              }

              //if is chatbot Message Push Promise to obtain element to unresolvedDetectedMessages
              if (isChatBotMessage(element, selectorMessage)) {
                if (!isTyping) {
                  console.log('Restarting timer M1');
                  timeout = restartTimeOut(5000, timeout, observer, timeOutCallBack);
                }
                console.log('Chatbot Promise Detected');
                if (!unResolvedDetectedMessages.includes(element)) {
                  unResolvedDetectedMessages.push(element);
                }
              }
              // does addedNode represents information that is loading or typing or contain one?
            }
          }

          // Removed Nodes
          for (const removedNode of mutation.removedNodes) {
            const element: HTMLElement = removedNode as HTMLElement;
            // Only allow nodes of type Element e Text
            if (
              removedNode.nodeType == Node.ELEMENT_NODE ||
              removedNode.nodeType == Node.TEXT_NODE
            ) {
              // was typing removed?
              if (isNodeTypingInfo(removedNode as HTMLElement)) {
                console.log('Detected Removed Typing, starting timeout');
                timeout = startTimeOut(5000, observer, timeOutCallBack);
              }
            }
          }
        } else if (mutation.type == 'characterData') {
          //  console.log("Detected mutation type characterData",mutation);
          // text altered
        } else {
          // atributtes
          //console.log("Detected mutation type atributtes",mutation);
        }
      }
    });
    const timeOutCallBack = async () => {
      detectedMessages = [...(unResolvedDetectedMessages || [])];
      unResolvedDetectedMessages = [];
      console.log('Got all Messages giving them back to llm', detectedMessages);
      observer.disconnect();
    };
    timeout = startTimeOut(7000, observer, timeOutCallBack);

    observer.observe(observedNode, {
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });

    waitForObserverDisconnect(observer).then(() => {
      console.log('Observer Disconnected');
      let newMessages: HTMLElement[] = detectedMessages;
      detectedMessages = [];
      resolve(newMessages);
    });
  });
}
function waitForObserverDisconnect(observer: MutationObserver): Promise<void> {
  return new Promise<void>((resolve) => {
    const originalDisconnect = observer.disconnect.bind(observer); // Store original disconnect

    observer.disconnect = () => {
      originalDisconnect();
      resolve();
    };
  });
}
