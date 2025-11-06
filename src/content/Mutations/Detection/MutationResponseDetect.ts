import { simulateInput } from "../../interaction/message-sender";
import { isChatBotMessage, isContainedInSelector, isNodeTypingInfo } from "../../interaction/utils";
import { findAncestralNodeBeforeContaining, findElementByExactText, sleep } from "../../lib/DomTools";
import AbstractMutationObserver from "../AbstractMutationManager";
import ElementFoundManager from "../AbstractElementManager";
import TimeoutManager from "../TimeoutManager";
import MessagesManager from "../ElementManager/MessagesManager";

// class Responsible for managing mutation observer for messages
class MutationResponseDetect extends AbstractMutationObserver<HTMLElement> {

    elementTracker: ElementFoundManager<HTMLElement>;
    initialText: string;
    ignoreInput: HTMLElement;
    userElement: HTMLElement;

    constructor(userElement:HTMLElement, ignoreInput:HTMLElement) {
        super();
        this.elementTracker = new MessagesManager();
        this.userElement = userElement;
        this.ignoreInput = ignoreInput;
        this.initialText = APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT;
        this.on('childList:added', this.handleAddedNodes.bind(this));
        this.on('characterData:change', this.handleCharacterDataChange.bind(this));
    }
    async init(target: Node): Promise<HTMLElement> {
 
        this.observer = new MutationObserver(this.mutationCallback);

        this.observer.observe(target, {
            childList: true,
            subtree: true,
            characterData: true,
        });
        this.timeoutManager = new TimeoutManager<void>(() => {
            this.observer?.disconnect();
            return Promise.resolve();
        },5000);
         this.timeoutManager.startTimeout();

      
        try{
            // Wait a bit to avoid capturing old messages
            await this.waitForObserverDisconnect();
            if (this.elementTracker.getElements().size === 0) {
            throw new Error("No element found");
           }
         
           return Array.from(this.elementTracker.getElements())[0];
        }catch (error) {
            throw new Error(`Observer failed: ${error instanceof Error ? error.message : String(error)}`);
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
                              const result = findElementByExactText(AddedNodeDetection, this.initialText);
          
                              const style = window.getComputedStyle(AddedNodeDetection);
                            const visible =
                              style.display !== "none" &&
                              style.visibility !== "hidden" &&
                              style.opacity !== "0";
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
                                // resolve com o nó adicionado
                                console.log("Detetou added Node ", AddedNodeDetection);
                                let teste = findAncestralNodeBeforeContaining(AddedNodeDetection, this.initialText);
                                // failsafe
                                console.log("teste Ancestral before ignored element", this.userElement);
                                this.elementTracker.add(teste);
                                console.log("mutation addedNode ", AddedNodeDetection);
                              }
                            }
          }
    

    handleCharacterDataChange(mutation: MutationRecord): void {
        this.timeoutManager?.restartTimeout();
            const ancestralNode = findAncestralNodeBeforeContaining(mutation.target, this.initialText);
                    console.log('Text changed:', mutation.target.textContent);
                    if(ancestralNode.textContent.trim() != this.initialText ){
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
