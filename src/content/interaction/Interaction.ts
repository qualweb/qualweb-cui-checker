import InterfaceChatbot from '../detection/InterfaceChatbot';
import InteractionWorkflow from './InteractionWorkflow';
import { inputMessage, inputVoiceMessage, sendMessage } from './message-sender';

export async function interactWithLLM(port: chrome.runtime.Port, voice: boolean): Promise<void> {
  // Obtain first messages of chatbot to build context
  let documentOwner = InterfaceChatbot.getInstance().getOwnerDocument();

  let firstMessages: HTMLElement[] = Array.from<HTMLElement>(
    documentOwner.querySelectorAll(InterfaceChatbot.getInstance().getSelectors().messagesSelector),
  ).slice(-2);

  // due to pricing of LLM models. Consider clearing chat before interaction or limiting number of messages.
  // Or fail gracefully and inform user that interaction should be done on a fresh chat.
  const interaction: InteractionWorkflow = new InteractionWorkflow(
    firstMessages,
    voice ? inputVoiceMessage : inputMessage,
    sendMessage,
    port,
  );

  await interaction.initInteraction();
}
