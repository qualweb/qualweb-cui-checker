import { showMessage } from "../../utils/helpers";
import { ChatBotSelectors } from "../../utils/types";
import { ChatbotInputElement } from "../interaction/message-sender";
import {
  findLowestCommonAncestorDOM,
  findDeepestNodeWithoutSibling,
  detectChatbotInputCrossOrigin,
  getGroupSelectorRelative,
  findScrollable,
  getIframeSelector,
} from '../lib/DomTools';
import { findMicrophoneButton } from "../lib/XPathTools";
import { setGreen, unsetGreen } from "../lib/visualHelpers";
import AbstractMutationObserver from "../Mutations/AbstractMutationManager";
import MutationChatbotDetect from "../Mutations/Detection/MutationChatbotDetect";
import MutationResponseDetect from "../Mutations/Detection/MutationResponseDetect";
import InterfaceChatbot from "./InterfaceChatbot";

interface ChatbotElementsDetected {
  iframeSelector?: string;
  windowElement: HTMLElement | null;
  inputElement: ChatbotInputElement | null;
  chatbotResponseElements: HTMLElement | null;
  dialogElement: HTMLElement | null;
  microphoneElement: HTMLElement | null;
  documentOwner: Document;
}


/** Class represents the current chatbot detection process */
 class ChatbotDetector {
  private static _instance: ChatbotDetector;
  private currentElementVerification: HTMLElement[] | HTMLElement | null = null;
  private currentMutationManager: AbstractMutationObserver<any> | null = null;

  private constructor(  ) {

  }
  public static getInstance(): ChatbotDetector {
    if (!ChatbotDetector._instance) {
      ChatbotDetector._instance = new ChatbotDetector();
    }
    return ChatbotDetector._instance;
  }

  async detect(userMessage:string): Promise<ChatBotSelectors> {
    const detectedElements = await this.initDetection(userMessage);
    // get selectors from detected elements and load interface
    const selectors = this.buildSelectors(detectedElements);

    InterfaceChatbot.getInstance().loadInterface(selectors);
    return selectors;
  }

  async correct(selector:string, userMessage:string): Promise<string>{
    const chatBotSelectorKeys = [
      'inputSelector',
      'messagesSelector',
      'dialogSelector',
      'microphoneSelector',
      'windowSelector'
    ];
    if (!this.currentElementVerification) {
      throw new Error('No current verification element found.');
    }
    if (!chatBotSelectorKeys.includes(selector)) {
      throw new Error('Invalid selector key provided.');
    }
    const elements = Array.isArray(this.currentElementVerification)
      ? this.currentElementVerification
      : [this.currentElementVerification];
    elements.forEach((el: HTMLElement) => unsetGreen(el));
    
    const detectedElements = await this.initDetection(userMessage);
    const selectorToElementMap: Record<string, HTMLElement | HTMLElement[] | null> = {
      inputSelector: detectedElements.inputElement,
      messagesSelector: detectedElements.chatbotResponseElements,
      dialogSelector: detectedElements.dialogElement,
      microphoneSelector: detectedElements.microphoneElement,
      windowSelector: detectedElements.windowElement,
    };

    const element = selectorToElementMap[selector];
    let newSelector = getGroupSelectorRelative(element);
    this.currentElementVerification = element;
    InterfaceChatbot.getInstance().updateSelector(selector as keyof ChatBotSelectors, newSelector ); 
    setGreen(element as HTMLElement);

    return newSelector;

  }

  async initDetection(userMessage:string): Promise<ChatbotElementsDetected> {
    const inputElement =await  detectChatbotInputCrossOrigin();
    if (!inputElement) {
      showMessage('No input element found for chatbot detection.');
      throw new Error('No input element found');
    }
    console.log("Input element for chatbot detection:", inputElement);
    // Strategy to obtain chatbot selectors
    InterfaceChatbot.getInstance().setInputElement(inputElement);

    const iframeSelector = getIframeSelector(inputElement);
    console.log("Iframe selector for chatbot detection:", iframeSelector);
    
    const messageSent = await this.detectUserMessage(inputElement,userMessage);
    console.log("User message element detected:", messageSent);

    const commonNode = findLowestCommonAncestorDOM(inputElement, messageSent);
    console.log("Common ancestor node detected:", commonNode);
    if(commonNode === null){
      throw new Error('No common ancestor found between input and user message.');
    }
    const targetWindow = findDeepestNodeWithoutSibling(commonNode, messageSent, inputElement);
    const scrollableChat = findScrollable(targetWindow) || targetWindow;


    const chatbotResponseElements = await this.detectChatbotResponse(messageSent, inputElement, scrollableChat);

    const microphoneElement = findMicrophoneButton(inputElement.ownerDocument.body);

    const chatbotDetected: ChatbotElementsDetected = {
      iframeSelector: iframeSelector|| undefined,
      windowElement: commonNode as HTMLElement,
      inputElement: inputElement,
      chatbotResponseElements: chatbotResponseElements,
      dialogElement: scrollableChat as HTMLElement,
      microphoneElement: microphoneElement as HTMLElement | null,
      documentOwner: inputElement.ownerDocument,
    };

    return chatbotDetected;
  }

  private buildSelectors(detectedElements: ChatbotElementsDetected): ChatBotSelectors {
     return {
      iframeSelector: detectedElements.iframeSelector || undefined,
      inputSelector: detectedElements.inputElement ? getGroupSelectorRelative(detectedElements.inputElement) || '' : '',
      messagesSelector: getGroupSelectorRelative(detectedElements.chatbotResponseElements) || '',
      dialogSelector: detectedElements.dialogElement ? getGroupSelectorRelative(detectedElements.dialogElement) || '' : '',
      microphoneSelector: detectedElements.microphoneElement ? getGroupSelectorRelative(detectedElements.microphoneElement) || undefined : undefined,
      windowSelector: detectedElements.windowElement ? getGroupSelectorRelative(detectedElements.windowElement) || '' : '',
    };
  }

  private async detectUserMessage(inputElement: ChatbotInputElement, userMessage: string): Promise<HTMLElement> {
    this.currentMutationManager = new MutationChatbotDetect(inputElement,userMessage);
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
      windowSelector: () => InterfaceChatbot.getInstance().getWindowElement(),
      inputSelector: () => InterfaceChatbot.getInstance().getInputElement(),
      dialogSelector: () => InterfaceChatbot.getInstance().getDialogElement(),
      microphoneSelector: () => InterfaceChatbot.getInstance().getMicrophoneElement(),
      messagesSelector: () =>
        Array.from(
          InterfaceChatbot.getInstance().getOwnerDocument().querySelectorAll<HTMLElement>(
            InterfaceChatbot.getInstance().getMessagesSelector(),
          ),
        ),
    };

    const element = elementGetters[elementName]?.();
    if (!element) return;

    this.currentElementVerification = element;
    const elements = Array.isArray(element) ? element : [element];
    if(!elementName.includes("windowSelector")){
    elements.forEach((el) => setGreen(el, InterfaceChatbot.getInstance().getWindowElement() as HTMLElement));
    } else {
      setGreen(element as HTMLElement);
    }
  }

  

   endConfirmation() {
    if (!this.currentElementVerification) return;

    const elements = Array.isArray(this.currentElementVerification)
      ? this.currentElementVerification
      : [this.currentElementVerification];
    elements.forEach((el) => unsetGreen(el));
    this.currentElementVerification = null;
  }

  reset(): void {
    InterfaceChatbot.getInstance().clearObject();
    this.currentElementVerification = null;
  }

  cancelDetection(): void {
    this.currentMutationManager?.cancelMutationObserver();
    this.reset();
  }
}

export default ChatbotDetector;