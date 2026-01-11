import { ChatBotSelectors, ChatbotInputElement } from '../../utils/types';
import * as Error from '../../errors/content/errors.class.content';

export default class ChatbotElements {
  private selectors: ChatBotSelectors;
  private documentOwner: Document = document;

  constructor() {
    this.selectors = {
      inputSelector: '',
      messagesSelector: '',
      dialogSelector: '',
      windowSelector: '',
    };
    this.documentOwner = document;
  }

  /**
   *
   * @param chatBotSelectors
   */
  public setSelectors(chatBotSelectors: ChatBotSelectors): void {
    if (!chatBotSelectors || Object.keys(chatBotSelectors).length === 0) {
      throw new Error.SelectorsNotFoundError('Invalid chatbot selectors provided');
    }
    this.selectors = chatBotSelectors;
    this.documentOwner = document;
  }

  public setupDocumentOwner(): void {
    try {
      if (this.selectors.iframeSelector) {
        const documentOwnerIframe: Document | null | undefined =
          document.querySelector<HTMLIFrameElement>(this.selectors.iframeSelector)?.contentDocument;
        if (!documentOwnerIframe) {
          throw new Error.IframeNotFoundError(this.selectors.iframeSelector);
        }
        this.documentOwner = documentOwnerIframe;
      } else {
        this.documentOwner = document;
      }
    } catch (error) {
      console.log('Error setting up document owner:', error);
      throw new Error.IframeNotFoundError(this.selectors.iframeSelector!);
    }
  }

  public updateSelector(key: keyof ChatBotSelectors, value: string): void {
    this.selectors[key] = value;
  }

  public getSelectors(): ChatBotSelectors {
    return this.selectors;
  }
  public getMessagesSelector(): string {
    if (!this.selectors.messagesSelector)
      throw new Error.MessageSelectorNotFoundError('Messages selector not found');

    return this.selectors.messagesSelector;
  }

  public clearObject(): void {
    this.selectors = {
      inputSelector: '',
      messagesSelector: '',
      dialogSelector: '',
      windowSelector: '',
    };
  }

  public checkIfElementsExist(): boolean {
    try {
      this.getInputElement();
      this.getMessagesSelector();
      this.getDialogElement();
      this.getWindowElement();
      this.getOwnerDocument();
      this.getMicrophoneElement();
      return true;
    } catch {
      return false;
    }
  }

  public isIframeChatbot(): boolean {
    return this.selectors.iframeSelector !== undefined && this.selectors.iframeSelector !== '';
  }
  // Getters
  public getWindowElement(): HTMLElement {
    try {
      const window = this.documentOwner.querySelector<HTMLElement>(this.selectors.windowSelector);
      if (!window)
        throw new Error.WindowNotFoundError(
          'Window element not found with selector: ' + this.selectors.windowSelector,
        );
      return window;
    } catch (error) {
      console.log('Error getting window element:', error);
      throw new Error.WindowNotFoundError(this.selectors.windowSelector);
    }
  }

  public getInputElement(): ChatbotInputElement {
    try {
      const input = this.documentOwner.querySelector<ChatbotInputElement>(
        this.selectors.inputSelector,
      );
      if (!input)
        throw new Error.InputNotFoundError(
          'Input element not found with selector: ' + this.selectors.inputSelector,
        );
      return input;
    } catch (error) {
      console.log('Error getting input element:', error);
      throw new Error.InputNotFoundError(this.selectors.inputSelector);
    }
  }

  public getDialogElement(): HTMLElement | null {
    try {
      const dialog = this.documentOwner.querySelector<HTMLElement>(this.selectors.dialogSelector);
      if (!dialog)
        throw new Error.DialogNotFoundError(
          'Dialog element not found with selector: ' + this.selectors.dialogSelector,
        );
      return dialog;
    } catch (error) {
      console.log('Error getting dialog element:', error);
      throw new Error.DialogNotFoundError(this.selectors.dialogSelector);
    }
  }

  public getMicrophoneElement(): HTMLElement | null {
    try {
      if (!this.selectors.microphoneSelector || this.selectors.microphoneSelector.trim() === '')
        return null;
      const microphone = this.documentOwner.querySelector<HTMLElement>(
        this.selectors.microphoneSelector,
      );
      if (!microphone)
        throw new Error.MicrophoneNotFoundError(
          'Microphone element not found with selector: ' + this.selectors.microphoneSelector,
        );
      return microphone;
    } catch (error) {
      console.log('Error getting microphone element:', error);
      throw new Error.MicrophoneNotFoundError(this.selectors.microphoneSelector!);
    }
  }
  public getOwnerDocument(): Document {
    try {
      if (!this.selectors.iframeSelector) return document;
      const iframe = this.documentOwner.querySelector<HTMLIFrameElement>(
        this.selectors.iframeSelector,
      );
      if (!iframe)
        throw new Error.IframeNotFoundError(
          'Iframe element not found with selector: ' + this.selectors.iframeSelector,
        );
      return iframe.contentDocument || document;
    } catch (error) {
      console.log('Error getting iframe element:', error);
      throw new Error.IframeNotFoundError(this.selectors.iframeSelector!);
    }
  }

  public clearInputFieldOrDiv(): void {
    const inputField = this.getInputElement();
    if (!inputField) {
      throw new Error.InputNotFoundError(this.selectors.inputSelector);
    }
    if (inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement) {
      inputField.value = '';
    } else {
      inputField.innerText = '';
    }
  }
}
