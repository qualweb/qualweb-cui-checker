import {
  LocalLLMResponse,
  sendPromptRequestCorrection,
} from '../../assistant-interaction/detection';

import { ChatBotInterface } from '../../utils/types';
import { chatbotInterface } from './Detection';
import { escapeCssSelector } from '../lib/DomTools';

/**
 * Corrects the chatbot interface elements based on the provided element name and document.
 * @param element - The HTML element to correct.
 * @param documentChatbot - The document containing the chatbot interface.
 * @param elementName - The name of the element to correct (e.g., "windowElement", "inputElement").
 * @returns A promise that resolves to the corrected ChatBotInterface.
 */
export async function correctElementChatbot(
  element: string,
  documentChatbot: Document,
  elementName: string,
): Promise<ChatBotInterface> {
  return new Promise((resolve, reject) => {
    let LLMResponse: LocalLLMResponse | null = null;
    let wrongSelector = '';
    switch (elementName) {
      case 'windowElement':
        wrongSelector = 'main_parent_window is not ' + chatbotInterface!.selectors.window[0];
        break;
      case 'inputElement':
        wrongSelector += 'main_parent_window is ' + chatbotInterface!.selectors.window[0];
        wrongSelector += '\ntext_input_element is not ' + chatbotInterface!.selectors.input[0];
        break;
      case 'dialogElement':
        wrongSelector += 'main_parent_window is ' + chatbotInterface!.selectors.window[0];
        wrongSelector += '\ntext_input_element is ' + chatbotInterface!.selectors.input[0];
        wrongSelector +=
          '\nchat_conversation_window is not ' + chatbotInterface!.selectors.dialog[0];
        break;
      case 'messagesSelector':
        wrongSelector += 'main_parent_window is ' + chatbotInterface!.selectors.window[0];
        wrongSelector += '\ntext_input_element is ' + chatbotInterface!.selectors.input[0];
        wrongSelector += '\nchat_conversation_window is ' + chatbotInterface!.selectors.dialog[0];
        wrongSelector +=
          '\nchatbot_message_element is not ' + chatbotInterface!.selectors.messages[0];
        break;
      case 'microphoneElement':
        wrongSelector += 'main_parent_window is ' + chatbotInterface!.selectors.window[0];
        wrongSelector += '\ntext_input_element is ' + chatbotInterface!.selectors.input[0];
        wrongSelector += '\nchat_conversation_window is ' + chatbotInterface!.selectors.dialog[0];
        wrongSelector += '\nchatbot_message_element is ' + chatbotInterface!.selectors.messages[0];
        wrongSelector += '\nmicrophone_button is not ' + chatbotInterface!.selectors.microphone[0];
        break;
    }

    sendPromptRequestCorrection(element, wrongSelector).then((response: LocalLLMResponse) => {
      LLMResponse = response;
      console.log('Response from LLM', LLMResponse);
      switch (elementName) {
        case 'windowElement':
          break;
        case 'inputElement':
          break;
        case 'dialogElement':
          break;
        case 'messagesSelector':
          if (LLMResponse.chatbot_message_element) {
            let messageSelector = escapeCssSelector(LLMResponse.chatbot_message_element);

            if (messageSelector) {
              chatbotInterface!.messagesSelector = messageSelector;
              chatbotInterface!.selectors.messages = [];
              chatbotInterface!.selectors.messages.push(messageSelector);
            }
          }
          break;
        case 'microphoneElement':
          if (LLMResponse.microphone_button) {
            let microphoneSelector = escapeCssSelector(LLMResponse.microphone_button);
            if (microphoneSelector) {
              chatbotInterface!.selectors.microphone = [];
              chatbotInterface!.selectors.microphone.push(microphoneSelector);
              chatbotInterface!.microphoneElement = documentChatbot.querySelector(
                microphoneSelector,
              ) as HTMLElement;
            }
          }
          break;
      }

      chatbotInterface!.selectors.messages.push(LLMResponse.chatbot_message_element!);

      if (LLMResponse.microphone_button) {
        chatbotInterface!.selectors.microphone.push(LLMResponse!.microphone_button);
      }
      resolve(chatbotInterface!);
    });
  });
}
