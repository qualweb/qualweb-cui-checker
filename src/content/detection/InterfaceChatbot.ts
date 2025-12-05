import { ChatBotSelectors } from '../../utils/types';
import { ChatbotInputElement } from '../interaction/message-sender';

class InterfaceChatbot {
  private static _instance: InterfaceChatbot;
  private windowElement: HTMLElement | null;
  private inputElement: ChatbotInputElement | null;
  private messagesSelector: string;
  private dialogElement: HTMLElement | null;
  private microphoneElement: HTMLElement | null;
  private selectors: ChatBotSelectors;
  private documentOwner: Document;

  private constructor() {
    this.windowElement = null;
    this.inputElement = null;
    this.messagesSelector = '';
    this.dialogElement = null;
    this.microphoneElement = null;
    this.selectors = {
      inputSelector: '',
      messagesSelector: '',
      dialogSelector: '',
      windowSelector: '',
    };
    this.documentOwner = undefined as unknown as Document;
  }

  public static getInstance(): InterfaceChatbot {
    if (!InterfaceChatbot._instance) {
      InterfaceChatbot._instance = new InterfaceChatbot();
    }
    return InterfaceChatbot._instance;
  }
  /**
   *
   * @param chatBotSelectors
   */
  public loadInterface(chatBotSelectors: ChatBotSelectors): void {
    this.selectors = chatBotSelectors;
    this.documentOwner = document;
    this._initiateElements();
  }

  public updateSelector(key: keyof ChatBotSelectors, value: string): void {
    this.selectors[key] = value;
    this._initiateElements();
  }

  /**
   *
   */
  private _initiateElements(): void {
    console.log('Initiating chatbot elements');
    // if is iframe, change document owner
    if (this.selectors.iframeSelector) {
      const documentOwnerIframe: Document | null | undefined =
        document.querySelector<HTMLIFrameElement>(this.selectors.iframeSelector)?.contentDocument;
      if (!documentOwnerIframe) {
        throw new Error('Iframe not found');
      }
      this.documentOwner = documentOwnerIframe;
    }

    this.inputElement = this.documentOwner.querySelector<ChatbotInputElement>(
      this.selectors.inputSelector,
    );
    this.windowElement = this.documentOwner.querySelector<HTMLElement>(
      this.selectors.windowSelector,
    );
    this.dialogElement = this.documentOwner.querySelector<HTMLElement>(
      this.selectors.dialogSelector,
    );
    this.messagesSelector = this.selectors.messagesSelector;
    this.microphoneElement = this.selectors.microphoneSelector
      ? this.documentOwner.querySelector<HTMLElement>(this.selectors.microphoneSelector)
      : null;
  }

  public isSelectorsSet() {
    return (
      !!this.selectors.windowSelector &&
      !!this.selectors.dialogSelector &&
      !!this.selectors.inputSelector &&
      !!this.selectors.messagesSelector &&
      (!!this.selectors.microphoneSelector || this.selectors.microphoneSelector == undefined) &&
      (!!this.selectors.iframeSelector || this.selectors.iframeSelector == undefined)
    );
  }

  /**
   *
   * @returns
   */
  public isElementsLoaded(): boolean {
    const iframeLoaded =
      !this.selectors.iframeSelector ||
      document.querySelector(this.selectors.iframeSelector) !== null;

    const baseElementsLoaded =
      this.documentOwner.querySelector<HTMLElement>(this.selectors.inputSelector) !== null &&
      this.documentOwner.querySelector<HTMLElement>(this.selectors.windowSelector) !== null &&
      this.documentOwner.querySelector<HTMLElement>(this.selectors.dialogSelector) !== null;

    const microphoneLoaded =
      !this.microphoneElement ||
      (this.selectors.microphoneSelector !== undefined &&
        this.documentOwner.querySelector<HTMLElement>(this.selectors.microphoneSelector) !== null);

    return iframeLoaded && baseElementsLoaded && microphoneLoaded;
  }

  public getSelectors(): ChatBotSelectors {
    return this.selectors;
  }

  public setSelectors(selectors: ChatBotSelectors): void {
    this.selectors = selectors;
  }
  public clearObject(): void {
    this.windowElement = null;
    this.inputElement = null;
    this.messagesSelector = '';
    this.dialogElement = null;
    this.microphoneElement = null;
    this.selectors = {
      inputSelector: '',
      messagesSelector: '',
      dialogSelector: '',
      windowSelector: '',
    };
  }

  public isIframeChatbot(): boolean {
    return this.selectors.iframeSelector !== undefined && this.selectors.iframeSelector !== '';
  }
  // Getters
  public getWindowElement(): HTMLElement | null {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    return this.windowElement;
  }

  public getInputElement(): ChatbotInputElement | null {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    return this.inputElement;
  }

  public setInputElement(input: ChatbotInputElement) {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    this.inputElement = input;
  }

  public getMessagesSelector(): string {
    return this.messagesSelector;
  }

  public getDialogElement(): HTMLElement | null {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    return this.dialogElement;
  }

  public getMicrophoneElement(): HTMLElement | null {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    return this.microphoneElement;
  }
  public getOwnerDocument(): Document {
    if (this.isSelectorsSet() && !this.isElementsLoaded()) this._initiateElements();
    return this.documentOwner;
  }
}

export default InterfaceChatbot;
