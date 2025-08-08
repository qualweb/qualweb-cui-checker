
import { ChatBotInterface, LLM_Settings } from "../utils/types";
import { chatbotInterface } from "../content/detection/Detection";
import { addSelectors } from "../content/evaluation/Evaluation";
import {initiateLangraphSettings,FinalOutput} from "./graph";
import { cleanHTML } from "../content/lib/DomTools";
import { AIMessage,HumanMessage, BaseMessage, isToolMessage, isHumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
const threadId = uuidv4();
interface InteractionStatus {
  counter: number;
}
const interactionStatus: InteractionStatus = {
  counter: 0,
};
/**
 * * Function to generate a question based on the message from the assistant
 * 
 * @param assistantMessage message from the assistant
 * @param setMessage  callback function to set the message
 * @param sendMessage  callback function to send the message
 * @returns promise that resolves to the question generated
 */
async function generateAndSendQuestion(
  assistantMessage: string,
  interactionGraph: any,
  setMessage: (message: string) => Promise<void>,
  sendMessage: () => Promise<void>
): Promise<FinalOutput> {
  // Prepare the correct input object for interactionGraph.invoke
const response = await interactionGraph.invoke(
  { messages: [new HumanMessage(assistantMessage)] },
  {
    configurable: {
      thread_id: threadId,
    },
  }
);
  const question: FinalOutput = response.finalOutput as FinalOutput;

  const questionText = question.response;
  console.log(questionText);
  if (question.status === "running") {
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
function normalizeText(text:string): string {
  return text
    .replace(/\s+/g, ' ') // replaces multiple spaces/newlines/tabs with a single space
    .trim(); 
}

function  markQuestion(question:string): void {

  const textNodeResult  = document.evaluate(`//*[text()='${question}']`, chatbotInterface!.dialogElement!.ownerDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (textNodeResult) {
    // Sobe ao nó pai, caso tenha encontrado um nó de texto
    const element = textNodeResult.nodeType === Node.TEXT_NODE
      ? textNodeResult.parentElement
      : textNodeResult as HTMLElement;

    // Adiciona o atributo de identificação à pergunta
    element?.setAttribute("qw-cui-question", interactionStatus.counter.toString());
  }
}

function markResponses(responses:HTMLElement[]): void {
  responses.forEach((response) => {
    const el = response as HTMLElement;
    el.setAttribute("qw-cui-response", interactionStatus.counter.toString());
  })
}



/**
 * * Function to initiate the interaction workflow 
 * 
 * @param initialMsg first message to start the interaction
 * @param setMessage  callback function to set the message
 * @param sendMessage  callback function to send the message
 * @param captureNewMessages callback function to capture new messages
 * @returns promise that resolves when the interaction is finished
 */
export async function initiateInteractionWorkflow(initialMsg: HTMLElement[],
  initialInput: string,
  setMessage: (message: string) => Promise<void>,
  sendMessage: () => Promise<void>,
  captureNewMessages: (message: string, check: string, maxWaitTime: number, chatbotInterface?: ChatBotInterface) => Promise<HTMLElement[]>,
  settings:LLM_Settings): Promise<void> {
  const interactionGraph = await initiateLangraphSettings(settings);

  // initial message
  let lasAnswersElements: HTMLElement[] = initialMsg;

  let lastAnswersRawText: string = document.URL +" " +  normalizeText(initialMsg.map((element) => element.textContent).join("\n").trim());

  
  return new Promise(async (resolve, reject) => {

    while (true) {
        // Mark Message Html as containing the objective
        interactionStatus.counter++;

         let question:FinalOutput = await generateAndSendQuestion(lastAnswersRawText, interactionGraph,setMessage, sendMessage);
         console.log("Question generated", question);
            if(question.lastMesssagePassedCheck){
          lasAnswersElements.forEach((element) => {
            element.setAttribute(question.lastMesssagePassedCheck!, "");
          });
          }

         if (question.status === "completed") {
          console.log("Finished interaction, no question generated");
          break;
        }
        markQuestion(question.response);
     
        // send the question to the assistant

      // wait for the answer and capture the new messages
      lasAnswersElements = await captureNewMessages(question.response, '', 4000, chatbotInterface!);
      markResponses(lasAnswersElements);
      console.log("New messages", lasAnswersElements);
      // encapsulate the HTMLElement in a parent element
      lastAnswersRawText = normalizeText(lasAnswersElements.map((element) => element.textContent).join("\n"));    
      }
    
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
    console.log("Element", lasAnswersElements[i]);
    let element = lasAnswersElements[i];
    // const xpath = `//*[text()='${option}']`;
    const xpath = `//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = '${option.toLowerCase().trim()}']`;
    const elementFound = document.evaluate(xpath, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null;
    if (elementFound) {
      console.log("Element found", elementFound);
      elementFound.click();
      break;
    }
  }
}

