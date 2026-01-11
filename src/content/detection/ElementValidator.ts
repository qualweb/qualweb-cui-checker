import { interruptSignalHandlerWithError } from '../../core/interrupter/signalUtil';
import ChatbotDetector from './ChatbotDetector';
import { ElementManualSelector } from './ElementManualSelector';
import InterfaceChatbot from './ChatbotElements';
import * as Error from '../../errors/content/errors.class.content';

type currentElementType = HTMLElement | HTMLElement[] | null;
interface IHighlightActions {
  highlight: (target: HTMLElement, limitTarget?: HTMLElement) => Promise<void> | void;
  unhighlight: (target: HTMLElement) => Promise<void> | void;
  unhighlightAll: () => Promise<void> | void;
}
interface IChatbotService {
  chatbotInterface: InterfaceChatbot;
  chatbotDetector: ChatbotDetector;
}

export class ElementValidator {
  //private currentElementVerification: currentElementType= null;
  private readonly elementManualSelector: ElementManualSelector;
  private readonly chatbotServices: IChatbotService;
  private readonly highlightController: IHighlightActions;
  private readonly abortController: AbortController = new AbortController();

  constructor(
    elementManualSelector: ElementManualSelector,
    chatbotServices: IChatbotService,
    highlightController: IHighlightActions,
  ) {
    this.elementManualSelector = elementManualSelector;
    this.chatbotServices = chatbotServices;
    this.highlightController = highlightController;
  }

  public getElementManualSelector(): ElementManualSelector {
    return this.elementManualSelector;
  }

  startConfirmation(selectorKey: string): void {
    const element = this.getElementBySelectorKey(selectorKey);

    const elements = Array.isArray(element) ? element : [element];
    if (selectorKey.includes('windowSelector')) {
      this.highlightController.highlight(element as HTMLElement);
    } else {
      elements.forEach((el) =>
        this.highlightController.highlight(
          el,
          this.chatbotServices.chatbotInterface.getWindowElement(),
        ),
      );
    }
  }

  private getElementHandlers(): Record<string, () => HTMLElement | HTMLElement[] | null> {
    return {
      windowSelector: () => this.chatbotServices.chatbotInterface.getWindowElement(),
      inputSelector: () => this.chatbotServices.chatbotInterface.getInputElement(),
      dialogSelector: () => this.chatbotServices.chatbotInterface.getDialogElement(),
      microphoneSelector: () => this.chatbotServices.chatbotInterface.getMicrophoneElement(),
      messagesSelector: () =>
        Array.from(
          this.chatbotServices.chatbotInterface
            .getOwnerDocument()
            .querySelectorAll<HTMLElement>(
              this.chatbotServices.chatbotInterface.getMessagesSelector(),
            ),
        ),
    };
  }

  async correct(selectorKey: string, userMessage: string, signal: AbortSignal): Promise<string> {
    const jointSignal = AbortSignal.any([this.abortController.signal, signal]);
    interruptSignalHandlerWithError(jointSignal);
    const element = this.getElementBySelectorKey(selectorKey);

    const elements = Array.isArray(element) ? element : [element];
    elements.forEach((el: HTMLElement) => this.highlightController.unhighlight(el));
    const oldSelector = this.chatbotServices.chatbotInterface.getSelectors();
    const newSelectors = await this.chatbotServices.chatbotDetector.initDetection(
      userMessage,
      jointSignal,
    );

    oldSelector[selectorKey] = newSelectors[selectorKey];

    this.chatbotServices.chatbotInterface.updateSelector(
      selectorKey as keyof typeof oldSelector,
      newSelectors[selectorKey],
    );

    if (jointSignal.aborted) throw new Error.CancellationError();

    return newSelectors[selectorKey];
  }

  private getElementBySelectorKey(selectorKey: string) {
    const elementGetters: Record<string, () => HTMLElement | HTMLElement[] | null> =
      this.getElementHandlers();

    const handler = elementGetters[selectorKey];
    if (!handler)
      throw new Error.InvalidSelectorProvidedError(`Invalid selector key: ${selectorKey}`);

    const element = handler();

    if (!element)
      throw new Error.ElementNotFoundError(`Element for ${selectorKey} not found on the page.`);
    return element;
  }

  endConfirmation(selectorKey: string): void {
    const element = this.getElementBySelectorKey(selectorKey);

    const elements = Array.isArray(element) ? element : [element];
    elements.forEach((el) => this.highlightController.unhighlight(el));
  }

  public destroy(): void {
    this.abortController.abort();
    this.elementManualSelector.cancelSelection();
  }
}
