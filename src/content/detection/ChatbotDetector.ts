import { showMessage } from '../../utils/helpers';
import { ChatBotSelectors,ChatbotInputElement} from '../../utils/types';
import* as Error from "../../errors/content/errors.class.content";
import {
  findLowestCommonAncestorDOM,
  findDeepestNodeWithoutSibling,
  detectChatbotInputCrossOrigin,
  getGroupSelectorRelative,
  findScrollable,
  getIframeSelector,
} from '../lib/DomTools';
import { findMicrophoneButton } from '../lib/XPathTools';
import AbstractMutationObserver from '../../core/mutations/base/AbstractMutationManager';
import MutationChatbotDetect from '../../core/mutations/detection/MutationChatbotDetect';
import MutationResponseDetect from '../../core/mutations/detection/MutationResponseDetect';
import { interruptSignalHandlerWithError } from '../../core/interrupter/signalUtil';
import InterfaceChatbot from './ChatbotElements';
import ChatbotActions from './ChatbotActions';
import MessagesManager from '../../core/elements/trackers/MessagesManager';
import TimeoutManager from '../../core/timeouts/TimeoutManager';
import { DialogNotFoundError, InputNotFoundError, WindowNotFoundError } from '../../errors/content/errors.class.content';


/** Class represents the current chatbot detection process */
class ChatbotDetector {

  private currentMutationManager: AbstractMutationObserver<any> | null = null;
  private readonly interfaceChatbot: InterfaceChatbot;
  private abortController: AbortController = new AbortController();
  constructor(interfaceChatbot: InterfaceChatbot) {
    this.interfaceChatbot = interfaceChatbot;
  }

  async detect(userMessage: string, signal: AbortSignal): Promise<ChatBotSelectors> {
    const combinedSignal = AbortSignal.any([this.abortController.signal, signal]);
   
    interruptSignalHandlerWithError(combinedSignal);


    const selectors = await this.initDetection(userMessage,signal);

  
    return selectors;
  }
  /**
 * Aguarda até que o elemento alvo pare de sofrer mutações por um período 'idle'
 */
async waitUntilStable(
  target: Node,
  idleTime = 1000,
  maxWait = 2000
): Promise<void> {
  return new Promise((resolve) => {
    let idleTimeout: NodeJS.Timeout;
    let mutationCount = 0;
    let checkInterval: NodeJS.Timeout;
    const maxTimeout = setTimeout(cleanup, maxWait);

    const observer = new MutationObserver(() => {
      mutationCount++;
      console.log('Mutation detected, resetting idle timer');
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(cleanup, idleTime);
    });

    function cleanup() {
      observer.disconnect();
      clearTimeout(idleTimeout);
      clearTimeout(maxTimeout);
      clearInterval(checkInterval);
      resolve();
    }

    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Verifica a cada 200ms se houve mutações
    let lastMutationCount = 0;
    checkInterval = setInterval(() => {
      // Se o contador não mudou, significa que não há mutações ativas
      if (mutationCount === lastMutationCount) {
        // Se já passou tempo suficiente sem mutações, considera estável
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(cleanup, idleTime);
      }
      lastMutationCount = mutationCount;
    }, 200);

    // Timer inicial: se não houver mutações neste período, considera loaded
    idleTimeout = setTimeout(cleanup, idleTime);
  });
}
  async initDetection(userMessage: string, signal: AbortSignal): Promise<ChatBotSelectors> {
    const combinedSignal = AbortSignal.any([this.abortController.signal, signal]);
    await this.waitUntilStable(document.body);
    // Handle abort signal 
    interruptSignalHandlerWithError(combinedSignal);

    const inputElement = this.detectInputElement();

    this.detectIframeElement(inputElement);
    const messageSentElement = await this.detectMessagesSentElement(inputElement, userMessage, signal);
    const windowElement = await this.detectWindowElement(inputElement, messageSentElement);

    const dialogElement = this.detectDialogElement(windowElement, messageSentElement, inputElement);
    //TODO: Problem with common Node element being outdated safer to pass only the selector

    await this.detectAssistantResponseElements(messageSentElement, inputElement, dialogElement, combinedSignal);

    this.detectMicrophoneElement(inputElement);

    return this.interfaceChatbot.getSelectors();
  }

  private detectMicrophoneElement(inputElement: ChatbotInputElement) {
    const microphoneElement = findMicrophoneButton(inputElement.ownerDocument.body);
    if (microphoneElement) {
      const microphoneSelector = getGroupSelectorRelative(microphoneElement);
      this.interfaceChatbot.updateSelector('microphoneSelector', microphoneSelector || '');
      console.log('Microphone selector for chatbot detection:', microphoneSelector);
    }
  }

  private async detectAssistantResponseElements(messageSentElement: HTMLElement, inputElement: ChatbotInputElement, dialogElement: any, combinedSignal: AbortSignal) {
    const responseElement = await this.detectChatbotResponse(
      messageSentElement,
      inputElement,
      dialogElement,
      combinedSignal
    );
    if(!responseElement) throw new Error.ChatbotNotDetectedError('No response element detected');
    const messagesSelector = getGroupSelectorRelative(responseElement);
    this.interfaceChatbot.updateSelector('messagesSelector', messagesSelector || '');
    console.log('Messages selector for chatbot detection:', messagesSelector);
  }

  private detectDialogElement(windowElement: Element, messageSent: HTMLElement, inputElement: ChatbotInputElement) {
    const targetWindow = findDeepestNodeWithoutSibling(windowElement, messageSent, inputElement);
    const scrollableChat = findScrollable(targetWindow) || targetWindow;
    if (!scrollableChat) {
      throw new DialogNotFoundError('No dialog element found');
    }
    const dialogSelector = getGroupSelectorRelative(scrollableChat);
    this.interfaceChatbot.updateSelector('dialogSelector', dialogSelector || '');
    console.log('Dialog selector for chatbot detection:', dialogSelector);
    return scrollableChat;
  }

  private async detectWindowElement(inputElement: ChatbotInputElement, messageSent: HTMLElement) {
    let windowElement : Element | null = null;
    const selectorMessage = getGroupSelectorRelative(messageSent);

      
    windowElement = findLowestCommonAncestorDOM(inputElement, messageSent);
    if (windowElement === null) {
      const message = document.querySelector<Element>(selectorMessage);
      const inputSelector = getGroupSelectorRelative(inputElement);
      const selectorInput = document.querySelector<Element>(inputSelector);
      if (!message || !selectorInput) {
        throw new WindowNotFoundError('Input or message element not found in DOM.');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      windowElement = findLowestCommonAncestorDOM(selectorInput, message);
    }
   
    if (windowElement === null) {
      throw new WindowNotFoundError('No common ancestor found between input and user message.');
    }
    const windowSelector = getGroupSelectorRelative(windowElement);
    this.interfaceChatbot.updateSelector('windowSelector', windowSelector || '');
    console.log('Window selector for chatbot detection:', windowSelector);
    return windowElement;
  }

  private async detectMessagesSentElement(inputElement: ChatbotInputElement, userMessage: string, signal: AbortSignal) {
    const messageSent = await this.detectUserMessage(inputElement, userMessage, signal);
    console.log('User message element detected:', messageSent);
    return messageSent;
  }

  private detectIframeElement(inputElement: ChatbotInputElement) {
    const iframeSelector = getIframeSelector(inputElement);
    this.interfaceChatbot.updateSelector('iframeSelector', iframeSelector || '');
     console.log('Iframe selector for chatbot detection:', iframeSelector);
    return iframeSelector;
  }

  private detectInputElement() {
    const inputElement = detectChatbotInputCrossOrigin();
    console.log('Detected input element for chatbot detection:', inputElement);
    if (!inputElement) {
      showMessage('No input element found for chatbot detection.');
      throw new InputNotFoundError('No input element found');
    }
    console.log('Input element for chatbot detection:', inputElement);
    // Strategy to obtain chatbot selectors
    // get Selector of input element
    const inputSelector = getGroupSelectorRelative(inputElement);
    this.interfaceChatbot.updateSelector('inputSelector', inputSelector || '');
    return inputElement;
  }
  
  private async detectUserMessage(
    inputElement: ChatbotInputElement,
    userMessage: string,
    signal: AbortSignal,
  ): Promise<HTMLElement> {
    
    interruptSignalHandlerWithError(signal);
    const actions = new ChatbotActions(this.interfaceChatbot);
    this.currentMutationManager = new MutationChatbotDetect(actions,new MessagesManager(), inputElement, userMessage,signal);
    // TODO remove hardcoded timeout
    this.currentMutationManager.setup(inputElement.ownerDocument.body,new TimeoutManager<HTMLElement>(5000));
    const messageSent = await this.currentMutationManager.init();
    this.currentMutationManager = null;
    if (!messageSent) {
      throw new Error.ChatbotNotDetectedError('Added message not found');
    }
    return messageSent;
  }

  private async detectChatbotResponse(
    messageSent: HTMLElement,
    inputElement: ChatbotInputElement,
    scrollableChat: HTMLElement,
    signal: AbortSignal,
  ): Promise<HTMLElement> {
    const combinedSignal = AbortSignal.any([this.abortController.signal, signal]);
   interruptSignalHandlerWithError(combinedSignal);

    console.log('Detecting chatbot response...');
    this.currentMutationManager = new MutationResponseDetect(messageSent, inputElement,combinedSignal);
    // TODO remove hardcoded timeout
    this.currentMutationManager.setup(scrollableChat,new TimeoutManager<HTMLElement>(5000));
    const response = await this.currentMutationManager.init();
    this.currentMutationManager = null;
    console.log('Chatbot response detected:', response);
    if (response === undefined) {
      throw new Error.ChatbotNotDetectedError('No response found');
    }
    return response;
  }

  cancelDetection(): void {
    this.abortController.abort();
    this.currentMutationManager?.cancelMutationObserver();
    this.abortController = new AbortController();
  }

}

export default ChatbotDetector;

