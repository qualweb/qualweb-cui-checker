import { ChatBotSelectors } from '../../utils/types';

import InterfaceChatbot from './InterfaceChatbot';
import  ChatbotDetector  from './ChatbotDetector';


// Singleton instance
export const chatbotInterface = new InterfaceChatbot();
export const chatbotDetector = new ChatbotDetector(chatbotInterface);

export async function detectAndGetSelectors(): Promise<ChatBotSelectors> {
  const selectors: ChatBotSelectors = await chatbotDetector.initDetection();
  chatbotInterface.loadInterface(selectors);
  return selectors;
}
