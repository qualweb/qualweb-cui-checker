import { isChatBotMessage, isContainedInSelector, isNodeTypingInfo } from "../../interaction/utils";
import AbstractMutationManager from "../AbstractMutationManager";
import ElementFoundManager from "../AbstractElementManager";
import TimeoutManager from "../TimeoutManager";
import MessagesManager from "../ElementManager/MessagesManager";
import InterfaceChatbot from "../../detection/InterfaceChatbot";


// class Responsible for managing mutation observer for messages
class MutationInteractionDetect extends AbstractMutationManager<HTMLElement[]> {

    elementTracker: ElementFoundManager<HTMLElement>;
    isTypingSign: boolean = false;
    selectorMessage: string;
    lastMessageUser: string = '';

    constructor() {
        super();
        this.elementTracker = new MessagesManager();
        this.selectorMessage = InterfaceChatbot.getInstance().getMessagesSelector() || '';
        this.on('childList:added', this.handleAddedNodes.bind(this));
        this.on('childList:removed', this.handleRemovedNodes.bind(this));
        this.on('attributes:change', this.handleAttributeChange.bind(this));
    }

    setLastUserMessage(message: string):void {
        this.lastMessageUser = message;
    };

    async init(): Promise<HTMLElement[]> {
        // reset previous elements from manager
        this.elementTracker.clear();
        this.observer = new MutationObserver(this.mutationCallback);
        const observedNode: Node | null = InterfaceChatbot.getInstance().getWindowElement()
        if(!observedNode){
            throw new Error("No observed node found");
        }
        this.observer.observe(observedNode, {
             subtree: true,
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            attributes: true,
            attributeOldValue: true,
        });
        this.timeoutManager = new TimeoutManager<void>(() => {
            this.observer?.disconnect();
            return Promise.resolve();
        });
         this.timeoutManager.startTimeout();

         try{
            // Wait a bit to avoid capturing old messages
            await this.waitForObserverDisconnect();
            this.lastMessageUser = '';
            if (this.elementTracker.getElements().size === 0) {
              
            throw new Error("No element found");
           }
         
           return  this.elementTracker.getElementsArray()
        }catch (error) {
            throw new Error(`Observer failed: ${error instanceof Error ? error.message : String(error)}`);
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
              if (isChatBotMessage(element, this.selectorMessage,this.lastMessageUser)) {
                this.handleMessageAdded(element, mutation);
              }
            }
          }
    }

    handleRemovedNodes(mutation: MutationRecord): void {
        // Implement logic for checking removed nodes
         for (const removedNode of mutation.removedNodes) {
            // Only allow nodes of type Element e Text
            if (
              removedNode.nodeType == Node.ELEMENT_NODE ||
              removedNode.nodeType == Node.TEXT_NODE
            ) {
              // was typing removed?
              if (isNodeTypingInfo(removedNode as HTMLElement)) {
                console.log('Detected Removed Typing, starting timeout');
                this.timeoutManager!.startTimeout();
                this.isTypingSign = false;
              } else if (!this.isTypingSign) {
                console.log('Detected Removed Message, starting timeout');
                this.timeoutManager!.restartTimeout();
            }
          }
    }
    }
    

    handleAttributeChange(mutation: MutationRecord): void {
        // Implement logic for checking attribute changes
        const oldValue = mutation.oldValue;                  // Old value of the attribute
                    let newValue: string | null = null;
                    if (mutation.target instanceof Element) {
        
                      newValue = mutation.target.getAttribute(mutation.attributeName??'');
                    
                    }
                  if ((oldValue?.includes('typing') || oldValue?.includes('loading')) &&
                    (!newValue?.includes('typing') && !newValue?.includes('loading'))) {
                    if(this.isTypingSign){
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
          console.log('Detected Mutation inside MessageSelector', mutation);
          this.timeoutManager!.restartTimeout();
        }
      }
    }
    handleTypingIfAdded(addedNode: HTMLElement) {
      if (isNodeTypingInfo(addedNode)) {
        console.log('Detected Typing, stopping timeout');
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


}
export default MutationInteractionDetect;
