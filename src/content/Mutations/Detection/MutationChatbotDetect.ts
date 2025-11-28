import { simulateInput } from "../../interaction/message-sender";
import { sleep } from "../../lib/DomTools";
import AbstractMutationObserver from "../AbstractMutationManager";
import ElementFoundManager from "../AbstractElementManager";
import TimeoutManager from "../TimeoutManager";
import WindowElementManager from "../ElementManager/WindowElementManager";
import { findElementByExactTextContent } from '../../lib/XPathTools';

// class Responsible for managing mutation observer for messages
class MutationChatbotDetect extends AbstractMutationObserver<HTMLElement> {

    elementTracker: ElementFoundManager<HTMLElement>;
    initialText: string;
    ignoreInput: HTMLElement;

    constructor(ignoreInput:HTMLElement, initialText:string) {
        super();
        this.elementTracker = new WindowElementManager();
        this.ignoreInput = ignoreInput;
        this.initialText = initialText;
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
        });
         this.timeoutManager.startTimeout();

        await sleep(1000);
        
        await simulateInput(this.initialText);
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
        // added Nodes
          for (const addedNode of mutation.addedNodes) {
            // Only allow nodes of type Element
           if (addedNode.nodeType !== Node.ELEMENT_NODE)  continue; 
                               
         // Ignorar mutação se for dentro do elemento de input ou caso o addedNode contenha o ignoreInput
         if (this.ignoreInput && 
                 ( this.ignoreInput.contains(addedNode) ||
                   addedNode.contains(this.ignoreInput) ||
                    this.ignoreInput === mutation.target)) continue;          
                               // Verifica se o conteúdo de texto inclui a mensagem inicial  
                               const result = findElementByExactTextContent(addedNode as HTMLElement, this.initialText);
                               if(result && (addedNode as HTMLElement).tagName != 'BUTTON'){
                                   // resolve com o nó adicionado
                                   console.log("Found ",addedNode);
                                   this.elementTracker.add(addedNode as HTMLElement);
                                   this.timeoutManager!.stopTimeout();
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
