import { ChatResponse, ResponseStore } from "../utils/types";
import { dispatchEvents, captureResponse, setLastMessageUser } from "./chatInteraction";
import { sendMessageToBackground } from "./content";
import { getStoredMicrophoneButton } from "./selectVoiceinput";
import { chatbotInterface } from "./Detection";
import { CHAT_HISTORY,  } from "../assistant-interaction/models";
import { initiateInteractionWorkflow } from "../assistant-interaction/interactionWorkflow";
import { selectElementSafely } from "./detectChatbot";

export const userMessages: string[] = [];

export let responses: ResponseStore = {};
let sentMessage: string = '';

export function getSentMessage(): string {
  return sentMessage;
}

export function setSentMessage(message: string): void {
  sentMessage = message;
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

  
export function simulateInput(
  message: string,
) {
  const textEditor = chatbotInterface!.inputElement;
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
    console.error("Input field or rich text editor not found.");
  }
}

export async function inputMessage(
  message: string,
) {
  setLastMessageUser(message);
  // reload input field
  const inputField = selectElementSafely(
    chatbotInterface!.dialogElement!.ownerDocument,
    chatbotInterface!.selectors.input[0]!
  );
  const textEditor = inputField;
  if (textEditor?.tagName === "DIV") {
    if (message != "") {
      textEditor.innerHTML = message;
    } 
    } else if (
    textEditor?.tagName === "INPUT" ||
    textEditor?.tagName === "TEXTAREA"
  ) {
    if (message != "") {
      (textEditor as HTMLInputElement | HTMLTextAreaElement).value = message;
    }     
  } else {
    console.error("Input field or rich text editor not found.");
  }
}


export async function sendMessage(
) {
  const inputField = selectElementSafely(
    chatbotInterface!.dialogElement!.ownerDocument,
    chatbotInterface!.selectors.input[0]!
  );
  const textEditor = inputField as HTMLInputElement | HTMLTextAreaElement;

  if (textEditor?.tagName === "DIV") {
    textEditor.focus();
    dispatchEvents(textEditor);
  } else if (
    textEditor?.tagName === "INPUT" ||
    textEditor?.tagName === "TEXTAREA"
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

export async function interactWithLLM(): Promise<void> {
  // Obtain first messages of chatbot to build context
  let documentOwner = chatbotInterface!.dialogElement!.ownerDocument;
  let firstMessages: HTMLElement[] = Array.from(documentOwner.querySelectorAll(chatbotInterface!.selectors.messages[0]!)) as HTMLElement[];
  let request:string = Array.from(firstMessages).map((element) => element.textContent).join("\n");
  console.log("First messages: ", request);
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if(metaDescription) {
    request += metaDescription.getAttribute('content');
  }

  // Save title of the chatbot webpage

  let webpage = document.title;
  console.log("Webpage title: ", webpage);
  console.log("Webpage description: ", request);
  CHAT_HISTORY.saveContext({ input: webpage }, { output: "Chatbot Webpage title Saved" });
  CHAT_HISTORY.saveContext({ input: request }, { output: "Chatbot Webpage description Saved" });

  await initiateInteractionWorkflow(firstMessages,inputMessage,sendMessage,captureResponse);

  // Run other pipelines here



} 
