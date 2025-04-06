import { Runnable } from "@langchain/core/runnables";
import { ChatBotInterface } from "../utils/types";
import { chatbotInterface } from "../content/Detection";
import { avaliateMessageType } from "./Interaction";
import { chooseOptionForObjective, evaluatorMetricsObjective, extractOptions, generateQuestionChainConversation } from "./evaluator";
import { ConversationChain } from "langchain/chains";
import { getObjectiveDirectives, ObjectiveDirectives, OBJECTIVES } from "./objectives";


// Chain interface for the objective
interface ChainObjective {
  ChainCheckObjectiveReached: Runnable;
  ChainGenerateQuestionForObjective: ConversationChain;
  ChainChooseBestOptionForObjective: Runnable;
}

// Chain for the objective
let chainObjective: ChainObjective | null = null;

// Current objective
let currentObjective: ObjectiveDirectives | null = null;

// Current objective index
let indexOfObjective = 0;

/**
 * * Function to initiate the next objective chain
 */
async function initChainNextObjective() {
  // get the next objective
  currentObjective = await getNextObjectivePrompts();
  // initiate chains
  chainObjective = {
    ChainCheckObjectiveReached: await evaluatorMetricsObjective(currentObjective.promptEvaluator),
    ChainGenerateQuestionForObjective: await generateQuestionChainConversation(currentObjective.promptQuestion),
    ChainChooseBestOptionForObjective: await chooseOptionForObjective(currentObjective.objective),
  }
}
/**
 * * Function to evaluate if the objective was reached based on the message from the assistant
 * 
 * @param messageAssistant message from the assistant
 * @returns Promise that resolves to true if the objective is reached, false otherwise
 */
async function isObjectiveReached(messageAssistant:string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
  let response: { status: string, confidence: number } = { status: "incomplete", confidence: 0 };

  console.log("Objective", OBJECTIVES[indexOfObjective - 1].objective);


  response = await chainObjective!.ChainCheckObjectiveReached.invoke({
    objectiveLLM: currentObjective?.objective,

    answer: messageAssistant
  });


  console.log("Is the objective reach?", response);
  let confidenceMet = response.confidence > 70;
  resolve(confidenceMet);
  
});
}

/**
 * * Function to generate a question based on the message from the assistant
 * 
 * @param assistantMessage message from the assistant
 * @param setMessage  callback function to set the message
 * @param sendMessage  callback function to send the message
 * @returns promise that resolves to the question generated
 */
async function generateAndSendQuestion( assistantMessage:string, setMessage: (message: string) => Promise<void>,
                                        sendMessage: () => Promise<void>,):Promise<string> {
  return new Promise(async (resolve, reject) => {
  let question = await chainObjective!.ChainGenerateQuestionForObjective.invoke({ input: assistantMessage });

  let questionText = question.response;
  console.log(questionText);

  await setMessage(questionText);
  await sendMessage();
  resolve(questionText);  
});
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
  setMessage: (message: string) => Promise<void>,
  sendMessage: () => Promise<void>,
  captureNewMessages: (message: string, check: string, maxWaitTime: number, chatbotInterface?: ChatBotInterface) => Promise<HTMLElement[]>): Promise<void> {

  // initial message
  let lasAnswersElements: HTMLElement[] = initialMsg;

  let lastAnswersRawCode: string = initialMsg.map((element) => element.outerHTML).join("\n");

  let lastAnswersRawText: string = initialMsg.map((element) => element.textContent).join("\n");
  console.log("INITIAL Message ", lastAnswersRawText);
  // encapsulate the HTMLElement in a parent element
  let lastQuestion = "**No question made yet**";

  // initiate the first objective chain object 
  await initChainNextObjective();

  return new Promise(async (resolve, reject) => {

    while (true) {

      /*
         Evaluate the message type 
       */
      const chainType = await avaliateMessageType("", lastAnswersRawCode);

      /*
         Evaluate if the objective was reach based on last message 
       */
      if (lastAnswersRawText === "") {
        console.log("No answer, the user did not provide any answer,try again to formulate a question");
        lastAnswersRawText = "No answer, the user did not provide any answer,try again to formulate a question";
      }

      let objectiveReached = await isObjectiveReached(lastAnswersRawText);
      console.log("Objective reached", objectiveReached);
      if (objectiveReached) {
        // Mark Message Html as containing the objective

        //TODO Make new function to mark the message
        
        // if the objective is reached, load the next objective
        await initChainNextObjective();
      
          if (indexOfObjective === OBJECTIVES.length) {
          indexOfObjective = 0;
          console.log("Finished Interaction");
          break;
        }
      } 
      
      

      console.log("Message type", chainType);
      if (chainType === "message") {
        // if the objective is not reached, then ask a question to the assistant
        // i could add new context why it was not reach, in this case i could have another model that reasons and summarise why the objective was not reach
        lastQuestion = await generateAndSendQuestion(lastAnswersRawText, setMessage, sendMessage);

        // send the question to the assistant        
      }
      if (chainType === "options") {
        //TODO Improve options extraction and clicking
        console.log("Options");
        console.log(lastAnswersRawCode);
        let options = await extractOptions(lastAnswersRawCode);
        console.log("Options", options);

        console.log("Options Available", options);
        let question = options.question;
        let context = "";
        options.options.map((element) => {
          console.log(element)
          context += `\"${element}\",`;
        });
        console.log("Context", context);
        let bestOption = await chainObjective!.ChainChooseBestOptionForObjective.invoke({ message: lastQuestion, question: question, options: context });
        console.log(bestOption);
        clickOnOption(bestOption.content, lasAnswersElements);

      }
      if (chainType === "interface") {
        console.log("Interface");
        //TODO Explore possibility of interacting with the interface present in Assistant AI


      }

      // wait for the answer and capture the new messages
      lasAnswersElements = await captureNewMessages("", '', 2000, chatbotInterface!)
      console.log("New messages", lasAnswersElements);
      // encapsulate the HTMLElement in a parent element
      lastAnswersRawCode = lasAnswersElements.map((element) => element.outerHTML).join("\n");
      lastAnswersRawText = lasAnswersElements.map((element) => element.textContent).join("\n");
    }
  });
}



/**  function to get the next objective prompts
 * 
 * @returns the next objective prompts
 */
async function getNextObjectivePrompts(): Promise<ObjectiveDirectives> {
  let objective = getObjectiveDirectives(indexOfObjective);
  indexOfObjective++;
  return objective;
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

