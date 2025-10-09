import { ChatBotInterface, LLM_Settings } from '../utils/types';
import { chatbotInterface } from '../content/detection/Detection';
import { initiateLangraphSettings } from './graph';
import {interactionPort} from '../content/content';
import {RULES_TESTED} from '../content/evaluation/Evaluation'
import { v4 as uuidv4 } from 'uuid';
import {  HumanMessage} from '@langchain/core/messages';
import { FinalOutput } from './objectives';
const threadId = uuidv4();
interface InteractionStatus {
  counter: number;
}

let skipInterrupt = false;

const interactionStatus: InteractionStatus = {
  counter: 0,
};
const INTERRUPT_NODE_NAME = ["human_skip_interrupt_question","human_skip_interrupt_strategy"];
/**
 * 
 * @param stream 
 * @returns 
 */
async function trackGraphExecution(stream):Promise<StreamEvent> {
  let response;
  let currentNode ="";
  let lastEvent = null;
  for await (const step of stream) {
    console.log(step);    

    if (step.event === 'interrupt') {
      console.log("interrupt detected ")
      // Interrution stop tracking
      return {node:step.name,event:step.event,result:""};

      // Event Start Chain
    } else if (step.event === 'on_chain_start') {
          currentNode = step.name;
          console.log("Current Node", currentNode);
          if (step.name === 'domain_obtainer') {

            interactionPort?.postMessage({ rule: '', status: 'Obtaining Initial Context' });

          }else if (step.name === 'strategy_formulator') {
            interactionPort?.postMessage({ rule: '', status: 'Formulating Strategy' });
          }else if (step.name === 'question_formulator') {
            interactionPort?.postMessage({ rule: '', status: 'Formulating Question' });
          }else if (step.name === 'qw_browser_test') {
            interactionPort?.postMessage({ rule: '', status: 'Running in Browser Test' });
          }else if (INTERRUPT_NODE_NAME.includes(step.name) ){
            return {node:step.name,event:"interrupt",result:""};
          }
      //Event End Chain
    } else if (step.event === 'on_chain_end') {
          lastEvent = step;
          if (step.name === 'domain_obtainer') {
            interactionPort?.postMessage({ rule: '', status: 'Context Ready' });
          }else if (step.name === 'objective_assigner') {
            interactionPort?.postMessage({ rule: 'CODE_TEST', status: 'Current Objective' });
          }else if (step.name === 'strategy_formulator') {
            interactionPort?.postMessage({ rule: '', status: ' Strategy Ready' });
          }else if (step.name === 'question_formulator') {
            interactionPort?.postMessage({ rule: '', status: 'Question Ready' });
          }else if (step.name === 'strategy_formulator') {
            interactionPort?.postMessage({ rule: '', status: 'Formulating Strategy' });
          }else if (step.name === 'qw_browser_test') {
            interactionPort?.postMessage({ rule: '', status: 'Browser Test Complete' });
          }else if (step.name === 'ChannelWrite<...>') {
          if(step.data.output.finalOutput){
          console.log('final output Reached!=!');
          interactionPort?.postMessage({ rule: '', status: 'Waiting for answer' });
          }
          response = step.data!.output.finalOutput;
        }
        
    }
  }
 interactionPort?.postMessage({ rule: '', status: 'Waiting for answer' });
 return {node:"",event:"complete",result:response};
}
interface StreamEvent{
  node:string;
  event:string; // interrupt ou complete or other
  result:FinalOutput|string|null;
}

async function graphStreamLoop(messages,graph,config):Promise<FinalOutput> {
  let stream = await graph.streamEvents(messages, config);
  let eventStream:StreamEvent;
  while(true){
  
  eventStream = await trackGraphExecution(stream)
  if(eventStream.event==="interrupt"){
    if(skipInterrupt){
      console.log("Skip interrupted pressed, updating state");
      await graph.updateState(config,  { isSkipObjectivePressed: true });
      skipInterrupt=false;
        }else{
      console.log("SKIP NOT Pressed, passing to next node");
      await graph.updateState(config, {}, eventStream.node);
        
    }
    stream = await graph.streamEvents(null, config);
  }else{
    console.log("Complete interaction, event given back",eventStream );
    break;
  }

  }
  console.log("Event stream result ",eventStream.result);
  return eventStream.result as FinalOutput;
}

/**
 * * Function to generate a question based on the message from the assistant
 *
 * @param assistantMessage message from the assistant
 * @param interactionGraph
 * @param setMessage  callback function to set the message
 * @param sendMessage  callback function to send the message
 * @returns promise that resolves to the question generated
 */
async function generateAndSendQuestion(
  assistantMessage: string,
  interactionGraph: any,
  setMessage: (message: string) => Promise<void>,
  sendMessage: () => Promise<void>,
  ): Promise<FinalOutput> {

  let messages = { messages: [new HumanMessage(assistantMessage)] };

  let config = {
    configurable: {
      thread_id: threadId,
    },
    version: "v2" as const,
  };


  const finalState = await graphStreamLoop(messages,interactionGraph,config);

  const question: FinalOutput = finalState as FinalOutput;
  const questionText = question.response;
  if (question.status === 'running') {
    await setMessage(questionText);
    await sendMessage();
  }
  return question;
}

/**  Function to normalize the text
 *
 * @param text text to normalize
 * @returns
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // replaces multiple spaces/newlines/tabs with a single space
    .trim();
}

function markQuestion(question: string): void {
  const end = Math.min(100, question.length)
  const slicedQuestion = question.slice(0, end);
  const textNodeResult = document.evaluate(
    `//*[contains(text(), "${slicedQuestion}")]`,
    chatbotInterface!.dialogElement!.ownerDocument,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue;
  if (textNodeResult) {
    // Sobe ao nó pai, caso tenha encontrado um nó de texto
    const element =
      textNodeResult.nodeType === Node.TEXT_NODE
        ? textNodeResult.parentElement
        : (textNodeResult as HTMLElement);

    // Adiciona o atributo de identificação à pergunta
    element?.setAttribute('qw-cui-question', interactionStatus.counter.toString());
  }
}

function markResponses(responses: HTMLElement[]): void {
  responses.forEach((el) =>  el.setAttribute('qw-cui-response', interactionStatus.counter.toString()));
}

/**
 * * Function to initiate the interaction workflow
 *
 * @param initialMsg first message to start the interaction
 * @param setMessage  callback function to set the message
 * @param sendMessage  callback function to send the message
 * @param captureNewMessages callback function to capture new messages
 * @param settings
 * @returns promise that resolves when the interaction is finished
 */
export async function initiateInteractionWorkflow(
  initialMsg: HTMLElement[],
  setMessage: (message: string) => Promise<void>,
  sendMessage: () => Promise<void>,
  captureNewMessages: (
    message: string,
    maxWaitTime: number,
    chatbotInterface?: ChatBotInterface,
  ) => Promise<HTMLElement[]>,
  settings: LLM_Settings,
): Promise<void> {
  const interactionGraph = await initiateLangraphSettings(settings);

  // initial message
  let lastAnswersElements: HTMLElement[] = initialMsg;
  
  let lastAnswersRawText: string =
    'URL:' + document.URL +
    '  message:' +
    normalizeText(
      initialMsg
        .map((element) => element.textContent)
        .join('\n')
        .trim(),
    );
    if(!interactionPort) return;
    let action = ""
    interactionPort.onMessage.addListener((msg) => {
      if(msg==="cancel"){
        action="cancel";
      }else if (msg=="skip"){
        skipInterrupt = true;
      }
    });

  return new Promise(async (resolve, reject) => {
    while (true) {
      // Mark Message Html as containing the objective
      interactionStatus.counter++;
      if(action === "cancel") break;
      
      interactionPort?.postMessage({rule:"",status:"Generating Question" });

      let question: FinalOutput = await generateAndSendQuestion(
        lastAnswersRawText,
        interactionGraph,
        setMessage,
        sendMessage,
      );

      //TODO: Simplify code
      if (question.lastMesssagePassedCheck) {
        let passedCheck = question.lastMesssagePassedCheck;
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
        RULES_TESTED.push(test);
        }
        //Mark Response with special selector
        lastAnswersElements.forEach((element) => {
          element.setAttribute(selector, '');
        });
      }
      if (question.status === 'completed') {
        console.log('Finished interaction, no question generated');
        break;
      }
      markQuestion(question.response);

      // send the question to the assistant

      // wait for the answer and capture the new messages
      lastAnswersElements = await captureNewMessages(question.response, 4000, chatbotInterface!);
      interactionPort?.postMessage({rule:"",status:"Detected New Response" });

      markResponses(lastAnswersElements);
      console.log('New messages', lastAnswersElements);
      // encapsulate the HTMLElement in a parent element
      lastAnswersRawText = normalizeText(
        lastAnswersElements.map((element) => element.textContent).join('\n'),
      );
    }
    interactionPort?.postMessage({rule:"",status:"complete" });
    resolve();
  });
}

/** * Function to click on the option
 *
 * @param option option to click
 * @param lasAnswersElements
 */ //TODO Improve the function to click on the option
function clickOnOption(option: string, lasAnswersElements: HTMLElement[]) {
  for (let i = lasAnswersElements.length - 1; i >= 0; i--) {
    console.log('Element', lasAnswersElements[i]);
    let element = lasAnswersElements[i];
    // const xpath = `//*[text()='${option}']`;
    const xpath = `//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = '${option
      .toLowerCase()
      .trim()}']`;
    const elementFound = document.evaluate(
      xpath,
      element,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue as HTMLElement | null;
    if (elementFound) {
      console.log('Element found', elementFound);
      elementFound.click();
      break;
    }
  }
}
