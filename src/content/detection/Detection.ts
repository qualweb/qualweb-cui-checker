import { ChatBotInterface } from '../../utils/types';
import { setGreen, unsetGreen } from '../lib/visualHelpers';
import {
  findLowestCommonAncestorDOM,
  getFirstElementVisibleFromArray,
  sleep,
  findDeepestNodeWithoutSibling,
  detectChatbotInputCrossOrigin,
  getGroupSelectorRelative,
  findScrollable,
  getUniqueSelector,
} from '../lib/DomTools';

import { detectChatBotPageMutation } from './DetectionObservers';
import { detectChatBotResponseMutation } from './MessageObserver';
//import { detectMessageSelector, observeAndDetectMessagesSelector } from './MessageObserver';

export let chatbotInterface: ChatBotInterface | null = null;

export function setChatbotInterface(chatbot: ChatBotInterface) {
  chatbotInterface = chatbot;
}

export let HTMLCode: string = '';
export let documentOwner: Document;
let chatBotWindowTemp: HTMLElement | null = null;
let inputTemp: HTMLElement | null = null;
export let currentVerification: HTMLElement[] | HTMLElement | null = null;




/**
 * Detects a chatbot on the page by analyzing the HTML structure and identifying  common parent node from input for text and conversation messages.
 *
 *
 * @returns A promise that resolves to an object containing the chatbot interface selectors.
 */

export function detectAndGetSelectorsPageChatbot(): Promise<object> {
       return new Promise(async (resolve, reject) => {
    
        let messageSent:HTMLElement|null = null;


        let inputElement = detectChatbotInputCrossOrigin() as HTMLElement | null;
        console.log("input found",inputElement)
        if (!inputElement) {
            return reject({ status: 'No input element found' });
        }
        const doc = inputElement.ownerDocument.body;
        documentOwner = doc.ownerDocument;

        messageSent = await detectChatBotPageMutation(doc, 'Ola', inputElement);
        console.log("Detected Message INPUT",messageSent)
        if (!messageSent) {
            return reject({ status: 'Added message not found ' });
        }
        let userMessageSelector = getGroupSelectorRelative(messageSent);
         console.log("Selector Generated",userMessageSelector)
         if (!userMessageSelector) {
            return reject({ status: 'No group selector generated ' });
        }
        const commonNode = findLowestCommonAncestorDOM(inputElement, messageSent);
        console.log("Detected Common Node",commonNode)
        if (!commonNode) {
            return reject({ status: 'No Common Node found' });
        }      
        const targetWindow = findDeepestNodeWithoutSibling(commonNode, messageSent, inputElement);
        const scrollableChat = findScrollable(targetWindow) || targetWindow ;
        console.log("Detected CHAT WINDOWS",targetWindow)
        if (!targetWindow) {
            return reject({ status: 'No target window found' });
        }

        let chatbotResponseElement = await detectChatBotResponseMutation(scrollableChat,messageSent,'Ola');
        if(chatbotResponseElement=== undefined){
            return reject({ status: 'No response found' });
        }
        let chatbotSelector = getGroupSelectorRelative(chatbotResponseElement);
         console.log("Selector Generated",userMessageSelector)

        console.log("Detected Chatbot Selector",chatbotSelector)
        // Loop na iteração do mutation Observer

        let chatBotSelectors = {
          inputSelector: getUniqueSelector(inputElement),
          messagesSelector: chatbotSelector,
          dialogSelector: getUniqueSelector(scrollableChat),
          microphoneSelector: null,
          windowSelector: getUniqueSelector(commonNode),
        };
        documentOwner = doc.ownerDocument;
        populateChatbotInterface(chatBotSelectors);

        // normalizar seletores

        resolve({ status: 'Chatbot detected', chatbot: chatBotSelectors });
    });

}


export function populateChatbotInterface(chatBotSelectors:any){
 
    let inputElementFound = documentOwner.querySelector<HTMLElement>(chatBotSelectors.inputSelector);
    let windowElementFound  = documentOwner.querySelector<HTMLElement>(chatBotSelectors.windowSelector);
    let dialogElementFound = documentOwner.querySelector<HTMLElement>(chatBotSelectors.dialogSelector);
    let microphoneElementFound = null;
    if (!inputElementFound || !windowElementFound || !dialogElementFound) {
        console.error('Input, chat window or dialog element not found using selectors.');
        return;
    }

  
  chatbotInterface = {
          windowElement: windowElementFound,
          inputElement: inputElementFound,
          messagesSelector: chatBotSelectors.messagesSelector,
          dialogElement: dialogElementFound,
          microphoneElement: null,
          selectors: {
            window: [chatBotSelectors.windowSelector],
            dialog: [chatBotSelectors.dialogSelector],
            messages: [chatBotSelectors.messagesSelector],
            input: [chatBotSelectors.inputSelector],
            microphone: [],
          },
        };
       
}



/** * Starts the confirmation process for a specific chatbot element.
 *
 * @param elementName  the name of the chatbot element to confirm
 */
export function startConfirmElement(elementName: string) {
  if (elementName === 'windowSelector') {
    currentVerification = chatbotInterface!.windowElement!;
    setGreen(chatbotInterface!.windowElement!);
  } else if (elementName === 'inputSelector') {
    currentVerification = chatbotInterface!.inputElement!;
    setGreen(chatbotInterface!.inputElement!);
  } else if (elementName === 'dialogSelector') {
    currentVerification = chatbotInterface!.dialogElement!;
    setGreen(chatbotInterface!.dialogElement!);
  } else if (elementName === 'microphoneSelector') {
    currentVerification = chatbotInterface!.microphoneElement!;
    setGreen(chatbotInterface!.microphoneElement!);
  } else if (elementName === 'messagesSelector') {
    const elements = Array.from(
      documentOwner.querySelectorAll<HTMLElement>(chatbotInterface!.messagesSelector),
    );
    currentVerification = elements;
    currentVerification.forEach((element) => {
      setGreen(element);
    });
  }
}

/** * Requests correction of a chatbot element based on the provided element name.
 *
 * @param chatBotElementName  the name of the chatbot element to correct
 * @returns
 */
export async function requestCorrectionElement(chatBotElementName: string): Promise<object> {
  return new Promise(async (resolve) => {
    if (!currentVerification) {
      console.error('No current verification element found.');
      return;
    }
    unsetGreen(currentVerification);
    currentVerification = null;

    let elementToCorrect = chatBotElementName;
    let chatbotCorrection = true; //TODO: Implement correction logic with new mutation observers made
    let chatBotElements = {};
    /*
    if (chatbotCorrection) {
      chatBotElements = {
        inputElement: Boolean(chatbotCorrection.inputElement),
        messagesSelector: Boolean(chatbotCorrection.messagesSelector),
        dialogElement: Boolean(chatbotCorrection.dialogElement),
        microphoneElement: Boolean(chatbotCorrection.microphoneElement),
        windowElement: Boolean(chatbotCorrection.windowElement),
      };
    }*/
    resolve({ status: 'Chatbot element corrected', chatbot: chatBotElements });
  });
}
