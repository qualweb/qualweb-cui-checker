import { interruptSignalHandlerWithError } from '../../core/interrupter/signalUtil';
import ChatbotActions from '../detection/ChatbotActions';
import { InteractionWorkflowFactory } from '../factories/InteractionWorkflowFactory';
import { ChatbotElementsFactory } from '../factories/ChatbotElementsFactory';
import { registerActionHandlers } from './actions/ActionHandlers';

export async function interactWithLLM(
  port: chrome.runtime.Port,
  voice: boolean,
  selectors: any,
  signal: AbortSignal,
): Promise<void> {
  interruptSignalHandlerWithError(signal);
  // Obtain first messages of chatbot to build context
  const instanceChatbotElements = ChatbotElementsFactory.getInstance();
  instanceChatbotElements.setSelectors(selectors);
  const chatbotActions = new ChatbotActions(instanceChatbotElements);

  console.log('Chatbot elements not loaded yet, waiting to retry...');
  if (!instanceChatbotElements.checkIfElementsExist()) {
    await chatbotActions.simulateInput('Hello', signal);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    instanceChatbotElements.setSelectors(selectors);
  }

  let documentOwner = instanceChatbotElements.getOwnerDocument();

  let firstMessages: HTMLElement[] = Array.from<HTMLElement>(
    documentOwner.querySelectorAll(instanceChatbotElements.getSelectors().messagesSelector),
  ).slice(-2);
  console.log('First messages for interaction context:', firstMessages);
  await InteractionWorkflowFactory.init(chatbotActions, firstMessages, voice, port);

  const interactionWorkflow = InteractionWorkflowFactory.getInstance();
  registerActionHandlers();
  interactionWorkflow.init();
}
