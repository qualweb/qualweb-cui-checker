import { ChatResponse, LLM_Settings, QWCUI_Settings } from '../../utils/types';
import { captureResponse } from './message-observer';
import { sendMessageToBackground } from '../content';
import { chatbotInterface } from '../detection/Detection';

import { initiateInteractionWorkflow } from '../../assistant-interaction/interactionWorkflow';
import { inputMessage, sendMessage, simulateInput } from './message-sender';



export async function handleTypeMessages(request: { messages: string[] }): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];

  for (let i = 0; i < request.messages.length; i++) {
    const message = request.messages[i];
    let response: ChatResponse;

    if (chatbotInterface) {
      await sendAndReceiveMessage(message);
      //chatResponses.push(response);
    } else {
      // response = await sendAndReceiveMessage(message);
    }

    if (i < request.messages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return chatResponses;
}

//Function to handle Voice input with tts
export async function handleVoiceInput(
  request: { messages: string[] },
  chatbotElement: HTMLElement | null,
): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];

  for (let message of request.messages)  {

    let response: ChatResponse;

    chatbotInterface?.microphoneElement!.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Logic for voice input
    await sendMessageToBackground('speakText', message);
    await new Promise((resolve) => setTimeout(resolve, 500));

    chatbotInterface?.microphoneElement!.click();

    // TODO: Implement handle voice input with lang graph
    if (chatbotElement) {
      // response = await sendAndReceiveMessage("", chatbotElement);
    } else {
      //  response = await sendAndReceiveMessage("");
    }

    //chatResponses.push(response);
  }

  return chatResponses;
}

export async function sendAndReceiveMessage(message: string): Promise<HTMLElement[]> {
  await simulateInput(message);
  return await captureResponse(message, 2000, chatbotInterface!);
}

export async function interactWithLLM(settings: QWCUI_Settings): Promise<void> {
  const LLMSettings: LLM_Settings = {
    LLMService: settings.LLMService,
    apiKey: settings.apiKey,
    locale: settings.locale
  };
  // if not valid LLM settings, throw error
  if (!LLMSettings.LLMService) {
    throw new Error('Invalid LLM settings');
  }
  // Obtain first messages of chatbot to build context
  let documentOwner = chatbotInterface!.dialogElement!.ownerDocument;
  let firstMessages: HTMLElement[] = Array.from(
    documentOwner.querySelectorAll(chatbotInterface!.messagesSelector),
  );

  await initiateInteractionWorkflow(
    firstMessages,
    inputMessage,
    sendMessage,
    captureResponse,
    LLMSettings,
  );
}
