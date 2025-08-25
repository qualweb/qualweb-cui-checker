
import { ChatBotInterface } from "../../utils/types";
import { correctElementChatbot } from "./Correction";
import { setGreen, unsetGreen } from "../lib/visualHelpers";
import { findLowestCommonAncestorDOM , cleanHTML, getFirstElementVisibleFromArray, sleep} from "../lib/DomTools";
import { identifyElementsPageChatbot } from "./DetectChatbot";
import { detectChatBotPageMutation, detectChatBotPopupMutation } from "./DetectionObservers";

export let chatbotInterface: ChatBotInterface | null = null;

export function setChatbotInterface(chatbot: ChatBotInterface) {
    chatbotInterface = chatbot;
}

export let HTMLCode: string = '';
export let documentOwner: Document;
let chatBotWindowTemp: HTMLElement | null = null;
let inputTemp: HTMLElement | null = null;
export let currentVerification: HTMLElement[] | HTMLElement | null = null;

/** * Detects a popup chatbot by observing mutations in the DOM.
 * 
 * @returns Promise<object> - Returns a promise that resolves to an object containing the chatbot interface selectors.
 */
export async function  detectPopupChatbot():Promise<object>{
  return new Promise( async (resolve, reject) => {
  try {
  let popupChatbot = await detectChatBotPopupMutation();
  
  if (!popupChatbot) {
    console.error("No chatbot popup detected.");
    reject({ status: 'No chatbot popup detected' });
    return;
  }
  let inputElements = popupChatbot.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]');
  let inputElement = getFirstElementVisibleFromArray(Array.from(inputElements)) as HTMLElement | null;
  inputTemp = inputElement;
  
  console.log("Input element found:", inputElement);

            if( !inputElement) {
              console.error("No input element found on the page.");
              reject({ status: 'No input element found' });
              return;
            }
            // start observing mutations
     let response = await detectChatBotPageMutation(popupChatbot,"Ola", inputElement as HTMLElement);
            console.log("Response from mutation observer:", response);
            if (!response) {
                console.error("No response found in the page mutations.");
                reject({ status: 'No response found' });
              return null;
            } 
            // send message
            const commonNode = findLowestCommonAncestorDOM(inputElement as HTMLElement, response);
            chatBotWindowTemp = commonNode as HTMLElement;
            console.log("Common node found:", commonNode);
            if (!commonNode) {
                return;
            }
            await sleep(1000)
  documentOwner = popupChatbot.ownerDocument;
  HTMLCode = cleanHTML(commonNode as HTMLElement);
  resolve({ status: 'Chatbot detected' });
  } catch (error) {
    reject({ status: 'Error in mutation observer', error });
  }

  });
}

/**
 * Detects a chatbot on the page by analyzing the HTML structure and identifying  common parent node from input for text and conversation messages.
 * 
 * 
 * @returns A promise that resolves to an object containing the chatbot interface selectors.
 */
export function detectAndGetSelectorsPageChatbot(): Promise<object> {
    return new Promise(async (resolve, reject) => {
        try {
            // look for input text in page

            let response: HTMLElement | null = null;
            // Try to find an <input> element
            let inputElements = document.querySelectorAll('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]');
            let inputElement = getFirstElementVisibleFromArray(Array.from(inputElements)) as HTMLElement | null;
            console.log("Input element found:", inputElement);
            if( !inputElement) {
              console.error("No input element found on the page.");
              reject({ status: 'No input element found' });
              return;
            }
            // start observing mutations
            response = await detectChatBotPageMutation(document.body,"Ola", inputElement as HTMLElement);
            console.log("Response from mutation observer:", response);
            if (!response) {
                console.error("No response found in the page mutations.");
                reject({ status: 'No response found' });
              return null;
            }
            // send message
            const commonNode = findLowestCommonAncestorDOM(inputElement as HTMLElement, response);
            console.log("Common node found:", commonNode);
            if (!commonNode) {
                return;
            }
            await sleep(1000)
           /* const targetWindow = findDeepestNodeWithoutSibling(commonNode,response,inputElement);
            if (!targetWindow) {
                console.error("No target window found in the common node.");
                reject({ status: 'No target window found' });
                return;
            }
            console.log("Target window found:", targetWindow);
            /*/
            documentOwner = commonNode.ownerDocument;
            HTMLCode = cleanHTML(commonNode as HTMLElement);
  
            // COUNt size in kb
            console.log(HTMLCode, " Cleaned HTML code");
            // count tokens 
            console.log(HTMLCode.length, " characters in HTML code");
            const chatbot =  await identifyElementsPageChatbot(HTMLCode,document, inputElement ,commonNode  );
        
          if (!chatbot) {
            console.log("No chatbot detected");
            reject({ status: 'No chatbot detected' });
            return;
          }
          chatbotInterface = chatbot;
          console.log("Chatbot detected", chatbotInterface);
          let chatBotSelectors= {};
        // normalize selectors
        if (chatbot) {
          chatBotSelectors = {
            inputSelector: chatbot.selectors.input[0],
            messagesSelector: chatbot.selectors.messages[0],
            dialogSelector: chatbot.selectors.dialog[0],
            microphoneSelector: chatbot.selectors.microphone[0],
            windowSelector: chatbot.selectors.window[0]
          };
        }
       resolve({ status: 'Chatbot detected', chatbot: chatBotSelectors });
  
        } catch (error) {
            reject({ status: 'Error in mutation observer', error });
        }
    });
}

/** Obtains the selectors of a chatbot of a previous identified popup.
 * 
 * @returns A promise that resolves to an object containing the chatbot interface selectors.
 */
export async function obtainSelectorsPopupChatbot():Promise<object> {

  return new Promise( async (resolve, reject) => {

  const chatbot =  await identifyElementsPageChatbot(HTMLCode,documentOwner, inputTemp! ,chatBotWindowTemp!  );
  if (!chatbot) {
    console.log("No chatbot detected");
    reject({ status: 'No chatbot detected' });
    return;
  }
  chatbotInterface = chatbot;
  console.log("Chatbot detected", chatbotInterface);
  let chatBotSelectors= {};
  // normalize selectors
  if (chatbot) {
    chatBotSelectors = {
      inputSelector: chatbot.selectors.input[0],
      messagesSelector: chatbot.selectors.messages[0],
      dialogSelector: chatbot.selectors.dialog[0],
      microphoneSelector: chatbot.selectors.microphone[0],
      windowSelector: chatbot.selectors.window[0]
    };
  }
  
  resolve({ status: 'Chatbot detected', chatbot: chatBotSelectors });
});
}

/** * Starts the confirmation process for a specific chatbot element.
 * 
 * @param elementName  the name of the chatbot element to confirm
 */
export function startConfirmElement(elementName:string) {
    if (elementName === "windowSelector") {
      currentVerification = chatbotInterface!.windowElement!;
      setGreen(chatbotInterface!.windowElement!);
  
    } else if (elementName === "inputSelector") {
      currentVerification = chatbotInterface!.inputElement!;
      setGreen(chatbotInterface!.inputElement!);
    } else if (elementName === "dialogSelector") {
      currentVerification = chatbotInterface!.dialogElement!;
      setGreen(chatbotInterface!.dialogElement!);
    } else if (elementName === "microphoneSelector") {
      currentVerification = chatbotInterface!.microphoneElement!;
      setGreen(chatbotInterface!.microphoneElement!);
    } else if (elementName === "messagesSelector") {
      const elements = Array.from(documentOwner.querySelectorAll<HTMLElement>(chatbotInterface!.messagesSelector));
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
  export async function requestCorrectionElement(chatBotElementName:string):Promise<object> {
    return new Promise(async (resolve) => {
      if (!currentVerification) {
        console.error("No current verification element found.");
        return;
      }
    unsetGreen(currentVerification);
    currentVerification = null;

      let elementToCorrect = chatBotElementName;
      let chatbotCorrection = await correctElementChatbot(HTMLCode, documentOwner, elementToCorrect);
      let chatBotElements = {};
      if (chatbotCorrection) {
        chatBotElements = {
          inputElement: Boolean(chatbotCorrection.inputElement),
          messagesSelector: Boolean(chatbotCorrection.messagesSelector),
          dialogElement: Boolean(chatbotCorrection.dialogElement),
          microphoneElement: Boolean(chatbotCorrection.microphoneElement),
          windowElement: Boolean(chatbotCorrection.windowElement)
        };
      }
      resolve({ status: 'Chatbot element corrected', chatbot: chatBotElements });

    });

  }