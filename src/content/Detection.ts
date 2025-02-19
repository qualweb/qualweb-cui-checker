import { ChatBotInterface } from "../utils/types";
import { cleanHTML, correctElementChatbot, detectChatBotPopupMutation, identifyElementsChatbot } from "./detectChatbot";
import { setGreen, unsetGreen } from "./selectChatbot";

export let chatbotInterface: ChatBotInterface | null = null;



export let HTMLCode: string = '';
export let documentOwner: Document;
export let currentVerification: HTMLElement[] | HTMLElement | null = null;

export async function detectChatbotPopup():Promise<object> {

    return new Promise( async (resolve, reject) => {

    let htmlElement = await detectChatBotPopupMutation();
    documentOwner = htmlElement.ownerDocument;
    HTMLCode = cleanHTML(htmlElement);

    const chatbot = await identifyElementsChatbot(HTMLCode, documentOwner);
    chatbotInterface = chatbot;
    let chatBotElements = {};
    if (chatbot) {
      chatBotElements = {
        inputElement: Boolean(chatbot.inputElement),
        messagesSelector: Boolean(chatbot.messagesSelector),
        dialogElement: Boolean(chatbot.dialogElement),
        microphoneElement: Boolean(chatbot.microphoneElement),
        windowElement: Boolean(chatbot.windowElement)
      };
    }
    resolve({ status: 'Chatbot detected', chatbot: chatBotElements });
});
}


export function startConfirmElement(elementName:string) {
    if (elementName === "windowElement") {
      currentVerification = chatbotInterface!.windowElement!;
      setGreen(chatbotInterface!.windowElement!);
  
    } else if (elementName === "inputElement") {
      currentVerification = chatbotInterface!.inputElement!;
      setGreen(chatbotInterface!.inputElement!);
    } else if (elementName === "dialogElement") {
      currentVerification = chatbotInterface!.dialogElement!;
      setGreen(chatbotInterface!.dialogElement!);
    } else if (elementName === "microphoneElement") {
      currentVerification = chatbotInterface!.microphoneElement!;
      setGreen(chatbotInterface!.microphoneElement!);
    } else if (elementName === "messagesSelector") {
      const result = documentOwner.evaluate(chatbotInterface!.messagesSelector, documentOwner, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const elements: HTMLElement[] = [];
  
      const numNodes = result.snapshotLength;
      for (let i = 0; i < numNodes; i++) {
        const node = result.snapshotItem(i);
        if (node instanceof HTMLElement) {
          elements.push(node);
        }
      }
      currentVerification = elements;
      currentVerification.forEach((element) => {
        setGreen(element);
      });
    }
  }


  export async function requestCorrectionElement(element:string):Promise<object> {
    return new Promise(async (resolve) => {
    unsetGreen(currentVerification!);
    currentVerification = null;

      let elementToCorrect = element;
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