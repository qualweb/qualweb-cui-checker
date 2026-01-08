import { sleep } from '../../../content/lib/DomTools';
import AbstractMutationObserver from '../base/AbstractMutationManager';
import ElementFoundManager from '../../elements/trackers/base/AbstractElementManager';
import TimeoutManager from '../../timeouts/TimeoutManager';
import ChatbotActions from '../../../content/detection/ChatbotActions';
import * as ErrorClass from '../../../errors/content/errors.class.content';
// class Responsible for managing mutation observer for messages
export class MutationMicButtonsDetect extends AbstractMutationObserver<HTMLElement[]> {
  elementTracker: ElementFoundManager<HTMLElement>;
  signal: AbortSignal;
  chatbotActions:ChatbotActions;

  constructor(chatbotActions:ChatbotActions,elementTracker: ElementFoundManager<HTMLElement>, signal: AbortSignal) {
    super();
    this.chatbotActions = chatbotActions;
    this.signal = signal;
    this.elementTracker = elementTracker;

    this.setupListeners();
  }

  private setupListeners(): void {
    this.on('childList:added', this.handleAddedNodes.bind(this));
    this.on('childList:removed', this.handleRemovedNodes.bind(this));
  }

   public setup(target: Node, timeoutManager: TimeoutManager<HTMLElement[]>): void {
    this.signal.throwIfAborted();
    this.observer = new MutationObserver(this.mutationCallback);
    const microphoneNodes = this.chatbotActions.getChabotElements().getMicrophoneElement();
    if (microphoneNodes) this.elementTracker.addElement(microphoneNodes);
    // Configuração do observer isolada
    this.observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.timeoutManager = timeoutManager;
    this.timeoutManager.setup(() => this.disconnect());

  }

  async init(): Promise<HTMLElement[]> {
    if (!this.timeoutManager) {
      throw new Error("TimeoutManager not set up.");
    }
    this.elementTracker.clear();
    this.timeoutManager.startTimeout();

    this.signal.throwIfAborted(); 
    await sleep(1000);
    this.signal.throwIfAborted(); 

    try {
      // Wait a bit to avoid capturing old messages
      await this.waitForObserverDisconnect(this.signal);
      this.observer?.disconnect();
      if (this.elementTracker.getElements().size === 0) {
        throw new Error('No element found');
      }

      return Array.from(this.elementTracker.getElements());
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
      // Only allow nodes of type Element
      if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
     // if button added or clickable element added


      

   

      
    }
  }

  handleRemovedNodes(mutation: MutationRecord): void {
    // removed Nodes
    for (const removedNode of mutation.removedNodes) {
      // Only allow nodes of type Element
      if (removedNode.nodeType !== Node.ELEMENT_NODE) continue;
      const selectorMicrophone = this.chatbotActions.getChabotElements().getSelectors().microphoneSelector;
      if (!selectorMicrophone) continue;
      const microphoneElement = (removedNode as HTMLElement).matches(selectorMicrophone);
      if (microphoneElement) {
      //  this.elementTracker.removeElement(removedNode as HTMLElement);
      }
      // Ignorar mutação se for dentro do elemento de input ou caso o removedNode contenha o ignoreInput
      // if button removed
    }
  }



  cancelMutationObserver(): void {
    this.timeoutManager?.stopTimeout();
    this.elementTracker.clear();
    this.observer!.disconnect();
  }
}
