
import { v4 as uuidv4 } from 'uuid';
import InterfaceChatbot from '../detection/InterfaceChatbot';
import { markQuestion, markResponses, normalizeText } from './utils';
import { FinalOutput } from '../../background/assistant-interaction/objectives';
import { ACTION } from '../../background/action-type';
import { EvaluationRunner } from '../evaluation/EvaluationRunner';
import MutationInteractionDetect from '../Mutations/Interaction/MutationInteractionDetect';

interface ConfigThread {
  configurable:{
  thread_id: string;
  },
  version: any;
}
  interface RuleTest{
    code:string;
    selector:string;
    result:string;
  }
class InteractionWorkflow {
  private initialMsg: HTMLElement[];
  private configContract: ConfigThread;
  private setMessage: (message: string) => Promise<void>;
  private sendMessage: () => Promise<void>;
  private isRunning: boolean = true;
  private counter: number = 0;
  private lastAnswersElements: HTMLElement[] = [];
  private mutationManager: MutationInteractionDetect;

  private backgroundPort: chrome.runtime.Port | null = null;


  constructor(
    initialMsg: HTMLElement[],
    setMessage: (message: string) => Promise<void>,
    sendMessage: () => Promise<void>,
    backgroundPort: chrome.runtime.Port
  ) {
    this.configContract = {
      configurable: {
        thread_id: uuidv4(),
      },
      version: "v2" as const,
    };
    //this.captureNewMessages = captureNewMessages;
    this.mutationManager = new MutationInteractionDetect();
    this.initialMsg = initialMsg;
    this.lastAnswersElements = initialMsg;
    this.setMessage = setMessage;
    this.sendMessage = sendMessage;
    this.backgroundPort = backgroundPort;
  }
  public async initInteraction(){
    this.setListenersPort();
    this.isRunning = true;

    // generate initial message 
    const assistantMessage = 'URL:' + document.URL +
    '  message:' + this.extractAssistantMessage(this.initialMsg);

    // send first message to background to start interaction loop
    console.log("Sending initial message to background:", assistantMessage);
    this.backgroundPort?.postMessage({ action: ACTION.MESSAGE, message: assistantMessage, config: this.configContract });

  }


  private extractAssistantMessage(responses: HTMLElement[]): string {
    return normalizeText(
      responses
        .map((element) => element.textContent)
        .join('\n')
        .trim(),
    );

  }

  private setListenersPort(){
    this.backgroundPort?.onMessage.addListener(async (msg) => {
      if (msg.action === ACTION.END_INTERACTION) {
        this.isRunning = false;
        this.mutationManager.cancelMutationObserver();
        this.backgroundPort?.disconnect();
        this.backgroundPort = null;
        console.log('Interaction ended by background');
        return;
      }else if (msg.action === ACTION.MESSAGE) {
        if(this.backgroundPort===null || !this.isRunning){
          return;
        }
        this.counter += 1;
        // process new question
        console.log("Processing new question:", msg.data);
        let question: FinalOutput  = msg.data as FinalOutput;
        // lasQuestion passed ?
        this.markPreviousQuestionIfPassed(question);
        // if complete interaction stop 
        if (question.status === 'completed') {
        console.log('Finished interaction, no question generated');
        this.isRunning = false;
        return;
       }
      // send and wait for question
         await this.setMessage(question.response);
         await this.sendMessage();
         // capture
          this.mutationManager.setLastUserMessage(question.response);
         this.lastAnswersElements = await this.mutationManager.init();
       // mark numbers
         markQuestion(InterfaceChatbot.getInstance().getOwnerDocument(), question.response, this.counter);
         markResponses(this.lastAnswersElements,this.counter);

        // send responses to background
        const assistantMessage = this.extractAssistantMessage(this.lastAnswersElements);  
        this.backgroundPort?.postMessage({ action: ACTION.MESSAGE, message: assistantMessage, config: this.configContract });

      }
    });
  }

      private markPreviousQuestionIfPassed(previousQuestion: FinalOutput): void {
        if (previousQuestion.lastMesssagePassedCheck) {
        let passedCheck = previousQuestion.lastMesssagePassedCheck;
        let selector: string = 
        typeof passedCheck === 'object' && passedCheck !== null && 'selector' in passedCheck
        ? passedCheck.selector
        : passedCheck;
        if (typeof passedCheck === 'object' && passedCheck !== null) {
          
        const check = passedCheck as { selector: string; code: string; outcome: string };
        const test: RuleTest = {
          code: check.code,
          selector: `[${check.selector}]`,
          result: check.outcome
        };
        EvaluationRunner.getInstance().addRuleTested(test);
        }
        //Mark Response with special selector
        this.lastAnswersElements.forEach((element) => {
          element.setAttribute(selector, '');
        });
      }
      

}
}
export default InteractionWorkflow;