import { ChatBotInterface } from '../../utils/types';
import {
  isChatBotMessage,
  isContainedInSelector,
  isNodeTypingInfo,
  restartTimeOut,
  startTimeOut,
  stopTimeout,
} from './utils';



export async function captureResponse(
  message: string,
  maxWaitTime = 2000,
  chatbotInterface?: ChatBotInterface,
): Promise<HTMLElement[]> {
  return await startObserverDetectMessages(message, maxWaitTime, chatbotInterface!);
}

let timeout: NodeJS.Timeout;
let isTypingSign: boolean = false;
let observer: MutationObserver;
let unResolvedDetectedMessages: HTMLElement[] = [];
let detectedMessages: HTMLElement[] = [];
let timeOutCallBack:() => Promise<void> ;

function restartTimer(){
  timeout = restartTimeOut(5000, timeout, observer, timeOutCallBack);
}

function handleTypingIfAdded(addedNode: Node) {
  if (isNodeTypingInfo(addedNode as HTMLElement)) {
    console.log('Detected Typing, stopping timeout');
    isTypingSign = true;
    stopTimeout(timeout);
  }
}

function handleMessageAdded(element: HTMLElement, selectorMessage: string, mutation: MutationRecord) {
  // if typing indication is off restart timer
  if (!isTypingSign) restartTimer();
    //Add message only if is not already in unresolved messages
  if (!unResolvedDetectedMessages.includes(element)) {
    unResolvedDetectedMessages.push(element);
  }
  // TODO: Check if is redundant
  if (isContainedInSelector(element, selectorMessage)) {
    if (!isTypingSign) {
      console.log('Detected Mutation inside MessageSelector', mutation);
      restartTimer();
    }
  }
}

function checkAddedNodes(mutation: MutationRecord,selectorMessage: string) {
  // added Nodes
  for (const addedNode of mutation.addedNodes) {
    // Only allow nodes of type Element
    if (addedNode.nodeType == Node.ELEMENT_NODE) {
      const element: HTMLElement = addedNode as HTMLElement;
      // handles typing sign if added
      handleTypingIfAdded(addedNode);
      //if is chatbot Message handle Message added lógic
      if (isChatBotMessage(element, selectorMessage)) {
        handleMessageAdded(element, selectorMessage, mutation);
      }
    }
  }
}

function checkRemovedNoded(mutation: MutationRecord) {
  for (const removedNode of mutation.removedNodes) {
    // Only allow nodes of type Element e Text
    if (
      removedNode.nodeType == Node.ELEMENT_NODE ||
      removedNode.nodeType == Node.TEXT_NODE
    ) {
      // was typing removed?
      if (isNodeTypingInfo(removedNode as HTMLElement)) {
        console.log('Detected Removed Typing, starting timeout');
        timeout = startTimeOut(5000, observer, timeOutCallBack);
        isTypingSign = false;
      } else if (!isTypingSign) {
        console.log('Detected Removed Message, starting timeout');
        timeout = restartTimeOut(5000, timeout, observer, timeOutCallBack);
      }
    }
  }
}

export function startObserverDetectMessages(
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
   unResolvedDetectedMessages = [];
   detectedMessages = [];

  if (!observedNode) return Promise.reject('Windows of chatbot not found, improper selector.');

  return new Promise((resolve) => {

    observer = new MutationObserver((mutations: MutationRecord[]) => {
       // Iterate through MutationRecord
      for (const mutation of mutations) {

        // Mutation type childList
        if (mutation.type == 'childList') {

          checkAddedNodes(mutation, selectorMessage);
          // Removed Nodes
          checkRemovedNoded(mutation);

          // MutationType characterData
        } else if (mutation.type == 'characterData') {
            //TODO: Logic when characterData
      }else if (mutation.type === 'attributes') {
            const oldValue = mutation.oldValue;                  // Old value of the attribute
            let newValue: string | null = null;
            if (mutation.target instanceof Element) {

              newValue = mutation.target.getAttribute(mutation.attributeName??'');
            
            }
          if ((oldValue?.includes('typing') || oldValue?.includes('loading')) &&
            (!newValue?.includes('typing') && !newValue?.includes('loading'))) {
            if(isTypingSign){
              console.log("Detected Removed typing sign, restarting timer");
               timeout = startTimeOut(5000, observer, timeOutCallBack);
            isTypingSign = false;
              
            }
         }
        }
      }
    });

    timeOutCallBack = async () => {
      detectedMessages = [...(unResolvedDetectedMessages || [])];
      unResolvedDetectedMessages = [];
      console.log('Got all Messages giving them back to llm', detectedMessages);
      observer.disconnect();
    };

    timeout = startTimeOut(7000,observer,timeOutCallBack );

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
export function waitForObserverDisconnect(observer: MutationObserver): Promise<void> {
  return new Promise<void>((resolve) => {
    // Store original disconnect
    const originalDisconnect = observer.disconnect.bind(observer); 

    observer.disconnect = () => {
      originalDisconnect();
      resolve();
    };
  });
}
