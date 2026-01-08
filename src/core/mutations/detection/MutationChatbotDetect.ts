import { sleep } from '../../../content/lib/DomTools';
import AbstractMutationObserver from '../base/AbstractMutationManager';
import ElementFoundManager from '../../elements/trackers/base/AbstractElementManager';
import TimeoutManager from '../../timeouts/TimeoutManager';
import { findElementByExactTextContent } from '../../../content/lib/XPathTools';
import ChatbotActions from '../../../content/detection/ChatbotActions';
import * as ErrorClass from '../../../errors/content/errors.class.content';
// class Responsible for managing mutation observer for messages
class MutationChatbotDetect extends AbstractMutationObserver<HTMLElement> {
  elementTracker: ElementFoundManager<HTMLElement>;
  initialText: string;
  ignoreInput: HTMLElement;
  signal: AbortSignal;
  chatbotActions:ChatbotActions;

  constructor(chatbotActions:ChatbotActions,elementTracker: ElementFoundManager<HTMLElement>, ignoreInput: HTMLElement, initialText: string,signal: AbortSignal) {
    super();
    this.chatbotActions = chatbotActions;
    this.signal = signal;
    this.elementTracker = elementTracker;
    this.ignoreInput = ignoreInput;
    this.initialText = initialText;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.on('childList:added', this.handleAddedNodes.bind(this));
    this.on('characterData:change', this.handleCharacterDataChange.bind(this));
  }

   public setup(target: Node,timeoutManager: TimeoutManager<HTMLElement>): void {
    this.signal.throwIfAborted();
    this.observer = new MutationObserver(this.mutationCallback);
    
    // Configuração do observer isolada
    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.timeoutManager = timeoutManager;
    this.timeoutManager.setup(() => this.disconnect());

  }

  async init(): Promise<HTMLElement> {
    if (!this.timeoutManager) {
      throw new  ErrorClass.InstanceNotInitializedError("TimeoutManager not set up.");
    }
  try {
    this.elementTracker.clear();
    this.timeoutManager.startTimeout();
    this.signal.throwIfAborted();

    await sleep(1000);
    this.signal.throwIfAborted();

    const completionPromise = this.waitForObserverDisconnect(this.signal);

    await this.chatbotActions.simulateInput(this.initialText, this.signal);

    const result = await completionPromise;
    if (result.cancelled) {
      throw new ErrorClass.CancellationError();
    }
    const elements = this.elementTracker.getElements();
    if (elements.size === 0) {
      throw new ErrorClass.ElementNotFoundError('No element found');
    }

    return Array.from(elements)[0];
  } catch (error) {
    this.cleanup();
    throw error;
  }

  }
   protected cleanup(): void {
    try {
      super.cleanup();
      this.elementTracker.clear();
    } catch  {
      // Ignore cleanup errors
    }
  }

  handleAddedNodes(mutation: MutationRecord): void {
    // added Nodes
    for (const addedNode of mutation.addedNodes) {

      if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;

      if (
        this.ignoreInput &&
        (this.ignoreInput.contains(addedNode) ||
          addedNode.contains(this.ignoreInput) ||
          this.ignoreInput === mutation.target)
      )
        continue;

      const result = findElementByExactTextContent(addedNode as HTMLElement, this.initialText);

      if (result && (addedNode as HTMLElement).tagName != 'BUTTON') {

        this.elementTracker.add(addedNode as HTMLElement);
        this.timeoutManager?.stopTimeout();
        this.disconnect();
      }
    }
  }

  handleCharacterDataChange(mutation: MutationRecord): void {
    if (mutation.target.textContent === this.initialText) {
      this.elementTracker.add(mutation.target.parentElement as HTMLElement);
      this.timeoutManager!.stopTimeout();
      this.disconnect();
    }
  }

  cancelMutationObserver(): void {
    this.timeoutManager?.stopTimeout();
    this.elementTracker.clear();
    this.observer!.disconnect();
  }
}
export default MutationChatbotDetect;
