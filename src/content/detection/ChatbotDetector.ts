import { showMessage } from "../../utils/helpers";
import { ChatBotSelectors } from "../../utils/types";
import { ChatbotInputElement } from "../interaction/message-sender";
import {
  findLowestCommonAncestorDOM,
  findDeepestNodeWithoutSibling,
  detectChatbotInputCrossOrigin,
  getGroupSelectorRelative,
  findScrollable,
  findMicrophoneButton,
  getIframeSelector,
} from '../lib/DomTools';
import { setGreen, unsetGreen } from "../lib/visualHelpers";
import AbstractMutationObserver from "../Mutations/AbstractMutationManager";
import MutationChatbotDetect from "../Mutations/Detection/MutationChatbotDetect";
import MutationResponseDetect from "../Mutations/Detection/MutationResponseDetect";
import InterfaceChatbot from "./InterfaceChatbot";

/** Class represents the current chatbot detection process */
 class ChatbotDetector {
  private chatbotInterface: InterfaceChatbot;
  private currentElementVerification: HTMLElement[] | HTMLElement | null = null;
  private currentMutationManager: AbstractMutationObserver<any> | null = null;
  // Current detection Elements
  private iframeSelector: string | null = null;
  private chatbotWindow: Element | null = null;
  private conversationContainer: Element | null = null;
  private inputElement: ChatbotInputElement | null = null;
  private chatbotResponseElements: HTMLElement | null = null;
  private microphoneElement: Element | null = null;

  constructor(chatbotInterface: InterfaceChatbot) {
    this.chatbotInterface = chatbotInterface;
  }


  async initDetection(): Promise<ChatBotSelectors> {
    const inputElement = detectChatbotInputCrossOrigin();
    if (!inputElement) {
      showMessage('No input element found for chatbot detection.');
      throw new Error('No input element found');
    }
    // Strategy to obtain chatbot selectors
    this.chatbotInterface.setInputElement(inputElement);

    const iframeSelector = getIframeSelector(inputElement);
    
    const messageSent = await this.detectUserMessage(inputElement);

    const commonNode = findLowestCommonAncestorDOM(inputElement, messageSent);
    if(commonNode === null){
      throw new Error('No common ancestor found between input and user message.');
    }
    const targetWindow = findDeepestNodeWithoutSibling(commonNode, messageSent, inputElement);
    const scrollableChat = findScrollable(targetWindow) || targetWindow;


    const chatbotResponseElements = await this.detectChatbotResponse(messageSent, inputElement, scrollableChat);

    const microphoneElement = findMicrophoneButton(inputElement.ownerDocument.body);

    this.chatbotWindow = commonNode;
    this.conversationContainer = scrollableChat;
    this.chatbotResponseElements = chatbotResponseElements;
    this.iframeSelector = iframeSelector;

    this.inputElement = inputElement;
    this.microphoneElement = microphoneElement;

    return this.buildSelectors();
  }

  private buildSelectors(){
     return {
      iframeSelector: this.iframeSelector || undefined,
      inputSelector: this.inputElement ? getGroupSelectorRelative(this.inputElement) || '' : '',
      messagesSelector: getGroupSelectorRelative(this.chatbotResponseElements) || '',
      dialogSelector: this.conversationContainer ? getGroupSelectorRelative(this.conversationContainer) || '' : '',
      microphoneSelector: this.microphoneElement ? getGroupSelectorRelative(this.microphoneElement) || undefined : undefined,
      windowSelector: this.chatbotWindow ? getGroupSelectorRelative(this.chatbotWindow) || '' : '',
    };
  }

  private async detectUserMessage(inputElement: ChatbotInputElement): Promise<HTMLElement> {
    this.currentMutationManager = new MutationChatbotDetect(inputElement);
    const messageSent = await this.currentMutationManager.init(inputElement.ownerDocument.body);
    if (!messageSent) {
      throw new Error('Added message not found');
    }
    return messageSent;
  }

  private async detectChatbotResponse(
    messageSent: HTMLElement,
    inputElement: ChatbotInputElement,
    scrollableChat: HTMLElement,
  ): Promise<HTMLElement> {
    this.currentMutationManager = new MutationResponseDetect(messageSent, inputElement);
    const response = await this.currentMutationManager.init(scrollableChat);
    if (response === undefined) {
      throw new Error('No response found');
    }
    return response;
  }

  
  startConfirmation(elementName: string): void {
    const elementGetters: Record<string, () => HTMLElement | HTMLElement[] | null> = {
      windowSelector: () => this.chatbotInterface.getWindowElement(),
      inputSelector: () => this.chatbotInterface.getInputElement(),
      dialogSelector: () => this.chatbotInterface.getDialogElement(),
      microphoneSelector: () => this.chatbotInterface.getMicrophoneElement(),
      messagesSelector: () =>
        Array.from(
          this.chatbotInterface.getOwnerDocument().querySelectorAll<HTMLElement>(
            this.chatbotInterface.getMessagesSelector(),
          ),
        ),
    };

    const element = elementGetters[elementName]?.();
    if (!element) return;

    this.currentElementVerification = element;
    const elements = Array.isArray(element) ? element : [element];
    elements.forEach((el) => setGreen(el));
  }

  endConfirmation(): void {
    if (!this.currentElementVerification) return;

    const elements = Array.isArray(this.currentElementVerification)
      ? this.currentElementVerification
      : [this.currentElementVerification];
    elements.forEach((el) => unsetGreen(el));
    this.currentElementVerification = null;
  }

  async requestCorrection(): Promise<ChatBotSelectors> {
    if (!this.currentElementVerification) {
      throw new Error('No current verification element found.');
    }
    unsetGreen(this.currentElementVerification);
    const selectors = await this.initDetection();
    this.currentElementVerification = null;
    return selectors;
  }

  reset(): void {
    this.chatbotInterface.clearObject();
    this.currentElementVerification = null;
  }

  cancelDetection(): void {
    this.currentMutationManager?.cancelMutationObserver();
    this.reset();
  }
}

export default ChatbotDetector;