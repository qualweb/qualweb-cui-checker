import { findAncestralNodeBeforeContaining } from '../../../content/lib/DomTools';
import AbstractMutationObserver from '../base/AbstractMutationManager';
import ElementFoundManager from '../../elements/trackers/base/AbstractElementManager';
import TimeoutManager from '../../timeouts/TimeoutManager';
import MessagesManager from '../../elements/trackers/MessagesManager';
import { findElementByExactTextContent } from '../../../content/lib/XPathTools';
import { interruptSignalHandlerWithError } from '../../interrupter/signalUtil';
import * as ErrorClass from '../../../errors/content/errors.class.content';
// class Responsible for managing mutation observer for messages
class MutationResponseDetect extends AbstractMutationObserver<HTMLElement> {
  elementTracker: ElementFoundManager<HTMLElement>;
  initialText: string;
  ignoreInput: HTMLElement;
  userElement: HTMLElement;
  signal: AbortSignal;

  constructor(userElement: HTMLElement, ignoreInput: HTMLElement,signal: AbortSignal) {
    super();
    this.signal = signal;
    this.elementTracker = new MessagesManager();
    this.userElement = userElement;
    this.ignoreInput = ignoreInput;
    this.initialText = APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT;
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
      throw new   ErrorClass.InstanceNotInitializedError("TimeoutManager not set up.");
    }
      interruptSignalHandlerWithError(this.signal);
    try {
    this.elementTracker.clear();    
    this.timeoutManager.startTimeout();

      const completionPromise = this.waitForObserverDisconnect(this.signal);

      // Wait a bit to avoid capturing old messages
      const result = await completionPromise;
      if (result.cancelled) {
        throw new ErrorClass.CancellationError();
      }
      if (this.elementTracker.getElements().size === 0) {
        throw new   ErrorClass.ElementNotFoundError('No element found');
      }

      return Array.from(this.elementTracker.getElements())[0];
    } catch (error) {
      throw error;
    }
  }

  handleAddedNodes(mutation: MutationRecord): void {
    this.timeoutManager?.restartTimeout();
    // added Nodes
    for (const addedNode of mutation.addedNodes) {
      // Only allow nodes of type Element
      if (addedNode.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const AddedNodeDetection = addedNode as HTMLElement;
      const result = findElementByExactTextContent(AddedNodeDetection, this.initialText);

      const style = window.getComputedStyle(AddedNodeDetection);
      const visible =
        style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      const rect = AddedNodeDetection.getBoundingClientRect();
      const hasSize = rect.width > 0 && rect.height > 0;

      if (
        AddedNodeDetection.tagName != 'BUTTON' &&
        AddedNodeDetection.textContent &&
        AddedNodeDetection.textContent.trim() &&
        !AddedNodeDetection.contains(result) &&
        visible &&
        hasSize &&
        AddedNodeDetection.textContent &&
        AddedNodeDetection.textContent.trim() != this.initialText
      ) {
        let teste = findAncestralNodeBeforeContaining(AddedNodeDetection, this.initialText);
        
        this.elementTracker.add(teste);
      }
    }
  }

  handleCharacterDataChange(mutation: MutationRecord): void {
    this.timeoutManager?.restartTimeout();
    const ancestralNode: HTMLElement = findAncestralNodeBeforeContaining(
      mutation.target as HTMLElement,
      this.initialText,
    );
    if (ancestralNode.textContent?.trim() != this.initialText) {
      this.elementTracker.add(ancestralNode);
    }
  }

  cancelMutationObserver(): void {
    this.timeoutManager?.stopTimeout();
    this.elementTracker.clear();
    this.observer!.disconnect();
  }
}
export default MutationResponseDetect;
