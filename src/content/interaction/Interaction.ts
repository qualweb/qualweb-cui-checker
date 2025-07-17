import { ChatResponse, LLM_Settings, QWCUI_Settings, ResponseStore } from "../../utils/types";
import { dispatchEvents, captureResponse, setLastMessageUser } from "./chatInteraction";
import { sendMessageToBackground } from "../content";
import { getStoredMicrophoneButton } from "../selectVoiceinput";
import { chatbotInterface } from "../detection/Detection";

import { initiateInteractionWorkflow } from "../../assistant-interaction/interactionWorkflow";



export const isPopupChatbot = false;

export const userMessages: string[] = [];

export let responses: ResponseStore = {};
let sentMessage: string = '';

export function getSentMessage(): string {
  return sentMessage;
}

export function setSentMessage(message: string): void {
  sentMessage = message;
}

export async function getCurrentStatusInteraction() {
  
}

export async function handleTypeMessages(request: { messages: string[] }): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];
  
  for (let i = 0; i < request.messages.length; i++) {
    const message = request.messages[i];
    let response: ChatResponse

    if (chatbotInterface) {
       await sendAndReceiveMessage(message);
      //chatResponses.push(response);
    } else {
      // response = await sendAndReceiveMessage(message);
    }

    if (i < request.messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return chatResponses;
}



//Function to hantdle Voice input with tts
export async function handleVoiceInput(request: { messages: string[] }, chatbotElement: HTMLElement | null): Promise<ChatResponse[]> {
    let chatResponses: ChatResponse[] = [];
  
    for (let i = 0; i < request.messages.length; i++) {
  
      const message = request.messages[i];
      let response: ChatResponse;
  
      chatbotInterface?.microphoneElement!.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      // Logic for voice input
      await sendMessageToBackground("speakText", message);
      await new Promise(resolve => setTimeout(resolve, 500));
      getStoredMicrophoneButton()!.click();
  
      if (chatbotElement) {
        // response = await sendAndReceiveMessage("", chatbotElement);
  
      } else {
        //  response = await sendAndReceiveMessage("");
      }
  
      //chatResponses.push(response);
  
  
    }
  
    return chatResponses;
  
  }

/*  
export function simulateInput(
  message: string,
) {
  const textEditor = chatbotInterface!.inputElement;
  if (!textEditor) {
    console.error("Input field not found.");
    return;
  }
  if (textEditor?.tagName === "DIV") {
    if (message != "") {
      setSentMessage(message);
      textEditor.innerHTML = message;
    } else {
      // text was voice input
      setSentMessage(textEditor.innerText);
    }
    textEditor.focus();
    dispatchEvents(textEditor);
  } else if (
    textEditor?.tagName === "INPUT" ||
    textEditor?.tagName === "TEXTAREA"
  ) {
    if (message != "") {
      setSentMessage(message);
      textEditor.focus();
      (textEditor as HTMLInputElement | HTMLTextAreaElement).value = message;
    } else {
      // text was voice input
      setSentMessage(
        (textEditor as HTMLInputElement | HTMLTextAreaElement).value
      );
      textEditor.focus();
    }
    dispatchEvents(textEditor);
  } else {
    
    let nestedInput =textEditor.querySelector('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]');
    console.log("Nested input found", nestedInput);
    if( nestedInput) {
      chatbotInterface!.inputElement = nestedInput as HTMLInputElement | HTMLTextAreaElement | HTMLDivElement;
      simulateInput(message);
      return;
    }else{
      console.error("Input field or rich text editor not found.");
      return;
    }
  }
}
*/

export async function simulateInput(
  message: string,inputElement?: HTMLInputElement | HTMLTextAreaElement | HTMLDivElement
) {
  await inputMessage(message,inputElement);
  await sendMessage(inputElement);
}


export async function inputMessage(
  message: string, inputElement?: HTMLInputElement | HTMLTextAreaElement | HTMLDivElement
) {
  setLastMessageUser(message);
  // reload input field
   let inputField:HTMLElement|null = inputElement || null;

   if(!inputElement){
   let ownerDocument = chatbotInterface!.dialogElement!.ownerDocument;
   inputField = ownerDocument.querySelector<HTMLElement>(chatbotInterface!.selectors.input[0]!);
  }

  // Element exists?
  if(!inputField) {
    console.error("Input field not found.");
    return;
  }
  // if inputFiels is not DIV, INPUT or TEXTAREA, find nested input
  if (inputField?.tagName !== "DIV" && inputField?.tagName !== "INPUT" && inputField?.tagName !== "TEXTAREA") {
    inputField = inputField.querySelector('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]');
  }

  if (inputField?.tagName === "DIV") {
    if (message != "") {
      inputField.innerHTML = message;
    } 
    } else if (
    inputField?.tagName === "INPUT" ||
    inputField?.tagName === "TEXTAREA"
  ) {
    if (message != "") {
      (inputField as HTMLInputElement | HTMLTextAreaElement).value = message;
    }     
  } else {
  
      console.error("Input field or rich text editor not found.");

  }
}



export async function sendMessage(inputElement?: HTMLInputElement | HTMLTextAreaElement | HTMLDivElement
) {
   let inputField:HTMLElement|null = inputElement || null;

   if(!inputElement){
   let ownerDocument = chatbotInterface!.dialogElement!.ownerDocument;
   inputField = ownerDocument.querySelector<HTMLElement>(chatbotInterface!.selectors.input[0]!);
  }

  if(!inputField) {
    console.error("Input field not found.");
    return;
  }
  // if inputField is not DIV content editable, INPUT or TEXTAREA, input should be nested
  if (inputField.tagName !== "DIV" && inputField.tagName !== "INPUT" && inputField.tagName !== "TEXTAREA") {
    inputField = inputField.querySelector('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]');
  }

  const textEditor = inputField as HTMLInputElement | HTMLTextAreaElement |HTMLDivElement;

  if (textEditor.tagName === "DIV") {
    textEditor.focus();
    dispatchEvents(textEditor);
  } else if (
    textEditor.tagName === "INPUT" ||
    textEditor.tagName === "TEXTAREA"
  ) {
    
      textEditor.focus();
    
    dispatchEvents(textEditor);
  } else {
    console.error("Input field or rich text editor not found.");
  }
}

export async function sendAndReceiveMessage(
  message: string,
): Promise<HTMLElement[]> {
  simulateInput(message);
  return await captureResponse(message, '', 2000, chatbotInterface!);
}

export async function interactWithLLM(settings:QWCUI_Settings): Promise<void> {
  const LLMSettings: LLM_Settings = {
    LLMService: settings.LLMService,
    model: settings.model,
    apiURL: settings.apiURL,
    apiKey: settings.apiKey,
  };
   // if not valid LLM settings, throw error
  if (!LLMSettings.LLMService) {
    throw new Error("Invalid LLM settings");
  }
  // Obtain first messages of chatbot to build context
  let documentOwner = chatbotInterface!.dialogElement!.ownerDocument;
  let firstMessages: HTMLElement[] = Array.from(documentOwner.querySelectorAll(chatbotInterface!.messagesSelector)) as HTMLElement[];
  let firstMessagesText:string = Array.from(firstMessages).map((element) => element.textContent).join("\n");

  // Obtain page title and description
  const pageTitle = document.title;
  const pageDescription = document.querySelector('meta[name="description"]');
  
  const firstInputChatbot =`
  Webpage title: ${pageTitle}
  Webpage description: ${pageDescription ? pageDescription.getAttribute('content') : 'No description available'}
  Chatbot first messages: ${firstMessagesText}
  `;
  

  await initiateInteractionWorkflow(firstMessages,firstInputChatbot,inputMessage,sendMessage,captureResponse,LLMSettings);



} 
