import {
  LocalLLMResponse,
  detetectPageChatbotLocalLLM,
} from '../../assistant-interaction/detection';

import { ChatBotInterface } from '../../utils/types';
import { clearDotIfCustomTagSelector, escapeCssSelector, getUniqueSelector } from '../lib/DomTools';

/** * Identifies the elements of a chatbot page using the provided element, document, input element, and chat window.
 *
 * @param htmlNodeText   The HTML node text to analyze for chatbot elements.
 * @param documentChatbot The document containing the chatbot interface.
 * @param inputElement  The input element used for text input in the chatbot.
 * @param chatWindow  The chat window element where messages are displayed.
 * @returns
 */
export async function identifyElementsPageChatbot(
  htmlNodeText: string,
  documentChatbot: Document,
  inputElement: Element,
  chatWindow: Element,
): Promise<ChatBotInterface> {
  return new Promise((resolve, reject) => {
    let LLMResponse: LocalLLMResponse | null = null;

    detetectPageChatbotLocalLLM(htmlNodeText).then((response: LocalLLMResponse) => {
      let chatbotInterface: ChatBotInterface = {
        windowElement: null,
        inputElement: null,
        messagesSelector: '',
        dialogElement: null,
        microphoneElement: null,
        selectors: {
          window: [],
          dialog: [],
          messages: [],
          input: [],
          microphone: [],
        },
      };
      console.log('Response from LLM', response);

      LLMResponse = response;
      console.log(' ARGS ', htmlNodeText, documentChatbot, inputElement, chatWindow);
      let inputSelector: string | null = getUniqueSelector(inputElement);
      let chatWindowSelector: string | null = getUniqueSelector(chatWindow);
      console.log('Input selector found: ', inputSelector);
      console.log('Chat window selector found: ', chatWindowSelector);

      if (chatWindowSelector) {
        chatbotInterface.windowElement =
          documentChatbot.querySelector<HTMLElement>(chatWindowSelector);
        chatbotInterface.selectors.window.push(chatWindowSelector);
      } else {
        console.warn('Chatbot window element not found, using default selector');
      }

      if (inputSelector) {
        chatbotInterface.inputElement = documentChatbot.querySelector<HTMLElement>(inputSelector);
        chatbotInterface.selectors.input.push(inputSelector);
      }
      if (chatWindowSelector) {
        chatbotInterface.dialogElement =
          documentChatbot.querySelector<HTMLElement>(chatWindowSelector);
        chatbotInterface.selectors.dialog.push(chatWindowSelector);
      }
      if (LLMResponse.chatbot_message_element) {
        let messageSelector = escapeCssSelector(LLMResponse.chatbot_message_element);
        let messages = documentChatbot.querySelectorAll<HTMLElement>(messageSelector);
        if (messages.length == 0) {
          console.warn('No messages found with selector: ', messageSelector);
          messageSelector = clearDotIfCustomTagSelector(messageSelector);
        }
        chatbotInterface.messagesSelector = messageSelector;
        chatbotInterface.selectors.messages.push(messageSelector);
      }
      if (LLMResponse.microphone_button) {
        let microphoneSelector = escapeCssSelector(LLMResponse.microphone_button);
        let microphoneElements = documentChatbot.querySelector<HTMLElement>(microphoneSelector);
        if (!microphoneElements) {
          console.warn('No microphone button found with selector: ', microphoneSelector);
          microphoneSelector = clearDotIfCustomTagSelector(microphoneSelector);
        }
        chatbotInterface.microphoneElement =
          documentChatbot.querySelector<HTMLElement>(microphoneSelector);
        chatbotInterface.selectors.microphone.push(microphoneSelector);
      }
      console.log('Chatbot interface detected', chatbotInterface);
      resolve(chatbotInterface);
    });
  });
}
