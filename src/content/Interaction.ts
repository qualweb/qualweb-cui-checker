import { ChatResponse, ResponseStore } from "../utils/types";
import { sendAndReceiveMessage } from "./chatInteraction";
import { ChatBotInterface } from "../utils/types";
import { sendMessageToBackground } from "./content";
import { getStoredMicrophoneButton } from "./selectVoiceinput";
import { chatbotInterface } from "./Detection";


export let responses: ResponseStore = {};
let sentMessage: string = '';

export function getSentMessage(): string {
  return sentMessage;
}

export function setSentMessage(message: string): void {
  sentMessage = message;
}


export async function handleTypeMessages(request: { messages: string[] }, chatbotInterface: ChatBotInterface | null): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];
  
  for (let i = 0; i < request.messages.length; i++) {
    const message = request.messages[i];
    let response: ChatResponse

    if (chatbotInterface) {
      response = await sendAndReceiveMessage(message, chatbotInterface);
      chatResponses.push(response);
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