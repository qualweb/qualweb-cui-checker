import { isChatBotMessage, isContainedInSelector, isNodeTypingInfo } from '../../../content/lib/utils';
import AbstractMutationManager from '../base/AbstractMutationManager';
import TimeoutManager from '../../timeouts/TimeoutManager';
import AbstractElementManager from '../../elements/trackers/base/AbstractElementManager';
import ChatbotActions from '../../../content/detection/ChatbotActions';
import * as ErrorClass from '../../../errors/content/errors.class.content';

// class Responsible for managing mutation observer for messages
class MutationInteractionDetect extends AbstractMutationManager<HTMLElement[]> {
  elementTracker: AbstractElementManager<HTMLElement>;
  isTypingSign: boolean = false;
  selectorMessage: string;
  lastMessageUser: string = '';
  signal: AbortSignal;
  chatbotActions:ChatbotActions;
  constructor(chatbotActions:ChatbotActions,elementTracker:AbstractElementManager<HTMLElement>, signal: AbortSignal) {
    super();
    this.chatbotActions = chatbotActions;
    this.elementTracker = elementTracker;
    this.signal = signal;
    const selectorMessage = this.chatbotActions.getChabotElements().getMessagesSelector();

    this.selectorMessage = selectorMessage;
    this.setupListeners();
  }
  private setupListeners(): void {
    this.on('childList:added', this.handleAddedNodes.bind(this));
    this.on('childList:removed', this.handleRemovedNodes.bind(this));
    this.on('attributes:change', this.handleAttributeChange.bind(this));
  }

  setLastUserMessage(message: string): void {
    this.lastMessageUser = message;
  }
 
  public setup(target: Node, timeoutManager: TimeoutManager<HTMLElement[]>): void {
    this.signal.throwIfAborted();
    this.observer = new MutationObserver(this.mutationCallback);

   this.observer.observe(target, {
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });

    this.timeoutManager = timeoutManager;

    this.timeoutManager.setup(() => this.disconnect());

  }
  async init(): Promise<HTMLElement[]> {
    this.signal.throwIfAborted();
    if (!this.timeoutManager) {
      throw new ErrorClass.InstanceNotInitializedError("TimeoutManager not set up.");
    }
    // reset previous elements from manager  
    try {
    this.elementTracker.clear();
    this.timeoutManager.startTimeout();

    const completionPromise = this.waitForObserverDisconnect(this.signal);
      // Wait a bit to avoid capturing old messages
      const result = await completionPromise;
      if (result.cancelled) {
        throw new ErrorClass.CancellationError();
      }
      this.lastMessageUser = '';

      return this.elementTracker.getElementsArray();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  handleAddedNodes(mutation: MutationRecord): void {
    // added Nodes
    for (const addedNode of mutation.addedNodes) {
      // Only allow nodes of type Element
      if (addedNode.nodeType == Node.ELEMENT_NODE) {
        const element: HTMLElement = addedNode as HTMLElement;
        // handles typing sign if added
        this.handleTypingIfAdded(element);
        //if is chatbot Message handle Message added lógic
        if (isChatBotMessage(element, this.selectorMessage, this.lastMessageUser)) {
          this.handleMessageAdded(element, mutation);
        }
      }
    }
  }

  handleRemovedNodes(mutation: MutationRecord): void {
    // Implement logic for checking removed nodes
    for (const removedNode of mutation.removedNodes) {
      // Only allow nodes of type Element e Text
      if (removedNode.nodeType == Node.ELEMENT_NODE || removedNode.nodeType == Node.TEXT_NODE) {
        // was typing removed?
        if (isNodeTypingInfo(removedNode as HTMLElement)) {
          this.timeoutManager!.startTimeout();
          this.isTypingSign = false;
        } else if (!this.isTypingSign) {
          this.timeoutManager!.restartTimeout();
        }
      }
    }
  }

  handleAttributeChange(mutation: MutationRecord): void {
    // Implement logic for checking attribute changes
    const oldValue = mutation.oldValue; // Old value of the attribute
    let newValue: string | null = null;
    if (mutation.target instanceof Element) {
      newValue = mutation.target.getAttribute(mutation.attributeName ?? '');
    }
    if (
      (oldValue?.includes('typing') || oldValue?.includes('loading')) &&
      !newValue?.includes('typing') &&
      !newValue?.includes('loading')
    ) {
      if (this.isTypingSign) {
        this.timeoutManager?.startTimeout();
        this.isTypingSign = false;
      }
    }
  }

  handleMessageAdded(element: HTMLElement, mutation: MutationRecord) {
    // if typing indication is off restart timer
    if (!this.isTypingSign) this.timeoutManager!.restartTimeout();
    //Add message only if is not already in unresolved messages
    if (!this.elementTracker.containsElement(element)) {
      this.elementTracker.add(element);
    }
    // TODO: Check if is redundant
    if (isContainedInSelector(element, this.selectorMessage)) {
      if (!this.isTypingSign) {
        this.timeoutManager!.restartTimeout();
      }
    }
  }
  handleTypingIfAdded(addedNode: HTMLElement) {
    if (isNodeTypingInfo(addedNode)) {
      this.isTypingSign = true;
      this.timeoutManager!.stopTimeout();
    }
  }

  cancelMutationObserver(): void {
    this.timeoutManager?.stopTimeout();
    this.lastMessageUser = '';
    this.elementTracker.clear();
    this.observer!.disconnect();
  }
  protected cleanup(): void {
    try {
      super.cleanup();
      this.lastMessageUser = '';
      this.elementTracker.clear();
    } catch  {
      // Ignore cleanup errors
    }
}
}
export default MutationInteractionDetect;
