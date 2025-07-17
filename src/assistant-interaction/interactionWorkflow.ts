import { Runnable } from "@langchain/core/runnables";
import { ChatBotInterface, LLM_Settings } from "../utils/types";
import { chatbotInterface } from "../content/detection/Detection";
import { analyseDomainChatbot, analyseServicesOfChatbot, avaliateMessageType } from "./Interaction";
import { chooseOptionForObjective, evaluatorMetricsObjective, extractOptions, generateQuestionChainConversation } from "./evaluator";
import { ConversationChain } from "langchain/chains";
import { getAllObjectives,  getObjectiveDirectivesByKey, Objective, ObjectiveDirectives, OBJECTIVES, ObjectiveSchema, ObjectivesMap } from "./objectives";
import { addSelectors } from "../content/evaluation/Evaluation";

import { is } from "cheerio/dist/commonjs/api/traversing";
import { CHAT_HISTORY, initiateModel, initiateModelsSettings } from "./models";
import { cleanHTML } from "../content/lib/DomTools";


// Chain interface for the objective
interface ChainObjective {
  ChainCheckObjectiveReached: Runnable;
  ChainGenerateQuestionForObjective: ConversationChain;
  ChainChooseBestOptionForObjective: Runnable;
}

// Chain for the objective
let chainObjective: ChainObjective | null = null;

// Current objective
let currentObjectiveDirectives: ObjectiveDirectives | null = null;

let currentObjective: ObjectiveSchema | null = null;
// 


let relevantObjectives:ObjectivesMap ={};

/**
 * * Function to initiate the next objective chain
 */
export async function initChainNextObjective(objectives:ObjectivesMap) {
  // get the next objective
  currentObjectiveDirectives = await getNextObjectivePrompts(objectives);
  // initiate chains
  chainObjective = {
    ChainCheckObjectiveReached: await evaluatorMetricsObjective(currentObjectiveDirectives.promptEvaluator),
    ChainGenerateQuestionForObjective: await generateQuestionChainConversation(currentObjectiveDirectives.promptQuestion),
    ChainChooseBestOptionForObjective: await chooseOptionForObjective(currentObjectiveDirectives.objective),
  }
}

/**
 * * Function to evaluate if the objective was reached based on the message from the assistant
 * 
 * @param messageAssistant message from the assistant
 * @returns Promise that resolves to true if the objective is reached, false otherwise
 */
async function isObjectiveReached(messageAssistant:string): Promise<string> {
  return new Promise(async (resolve, reject) => {
  let response: { evidence: string, confidence: number } = { evidence: "", confidence: 0 };

  console.log("Objective", currentObjective?.objectiveDescription);

  if(messageAssistant.trim() === "") {
    messageAssistant="No answer.";
  }
  response = await chainObjective!.ChainCheckObjectiveReached.invoke({
    objectiveLLM: currentObjectiveDirectives?.objective,

    answer: messageAssistant
  });


  console.log("Is the objective reach?", response);
  let confidenceMet = response.confidence > 70;
  if (confidenceMet) {
    resolve(response.evidence);
  } else {
    resolve("");
  }

  
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

function obtainRelevantObjectives(initialMsg:string): void{
  // Obtain all the objectives and get their identifiers
  let objectives:string[] = OBJECTIVES.map((objective) => {
    return objective.objective;
  }
  )
  // build new chain and pass this objectives for acessing what objectives are relevant to ask to assistant

  // For now all are added
  let objectivesMap:ObjectivesMap =   getAllObjectives();
  relevantObjectives = objectivesMap;

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
let questionNumber = 0;
function  markQuestion(question:string): void {
  questionNumber++;
  const textNodeResult  = document.evaluate(`//*[text()='${question}']`, chatbotInterface!.dialogElement!.ownerDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (textNodeResult) {
    // Sobe ao nó pai, caso tenha encontrado um nó de texto
    const element = textNodeResult.nodeType === Node.TEXT_NODE
      ? textNodeResult.parentElement
      : textNodeResult as HTMLElement;

    // Adiciona o atributo de identificação à pergunta
    element?.setAttribute("qw-question", questionNumber.toString());
  }
}

function markResponses(responses:HTMLElement[]): void {
  responses.forEach((response) => {
    const el = response as HTMLElement;
    el.setAttribute("qw-response", questionNumber.toString());
  })
}

async function initiateMemoryContext(initialInput:string): Promise<void> {

  let domain = await analyseDomainChatbot(initialInput);
  console.log("Domain", domain);
  // TODO, add domain to the context
  CHAT_HISTORY.saveContext({ input: domain }, { output: "CHATBOT Domain context saved." });
  let services =await analyseServicesOfChatbot(domain);
  CHAT_HISTORY.saveContext({ input: services }, { output: "CHATBOT offered assistance saved." });
  
  console.log("Services", services);
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
  await initiateModelsSettings(settings);
  await initiateMemoryContext(initialInput);
  // initial message
  let lasAnswersElements: HTMLElement[] = initialMsg;


  let lastAnswersRawCode: string = initialMsg.map((element) => cleanHTML(element)).join("\n");

  let lastAnswersRawText: string = normalizeText(initialMsg.map((element) => element.textContent).join("\n").trim());
  console.log("INITIAL Message ", lastAnswersRawText);
  
  if(lastAnswersRawText === "") {
    lastAnswersRawText = document.title;
  }
  
  // TODO, analyse chatbot context and get a selec, returning all for the moment
  obtainRelevantObjectives(lastAnswersRawText);
  
  // encapsulate the HTMLElement in a parent element
  let lastQuestion = "**No question made yet**";
  let isFirstMessage = true;
  // initiate the first objective chain object 
  await initChainNextObjective(relevantObjectives);

  return new Promise(async (resolve, reject) => {

    while (true) {

      /*
         Evaluate the message type 
       */
      console.log("Evaluating message type");
      console.log("Last message raw code", lastAnswersRawCode);
      const chainType = await avaliateMessageType("", lastAnswersRawCode);
      console.log("Message type", chainType);

      /*
         Evaluate if the objective was reach based on last message 
       */
      if (lastAnswersRawText === "") {
        console.log("No answer, the user did not provide any answer,try again to formulate a question");
        lastAnswersRawText = "No answer, the user did not provide any answer,try again to formulate a question";
      }
      console.log("Last message", lastAnswersRawText);
      
      if(!isFirstMessage){
      const objectiveEvidence = await isObjectiveReached(lastAnswersRawText);
      console.log("Objective reached", objectiveEvidence);
      if (objectiveEvidence) {
        // Mark Message Html as containing the objective

       
        lasAnswersElements.forEach((element) => {
          // set data attribute to the element
        
          element.setAttribute(`data-qw-${currentObjective?.data_attribute}`, objectiveEvidence );
        });
      
          currentObjective?.cui_checks.map((check) => {
            addSelectors({ [check]: `data-qw-${currentObjective?.data_attribute}`});
          });
        // if the objective is reached, load the next objective
        
      
          if (Object.keys(relevantObjectives).length === 0) {
 
          console.log("Finished Interaction");
          break;
        }
        await initChainNextObjective(relevantObjectives);
      } 
      }
      
      

      console.log("Message type", chainType);
      if (chainType === "message") {
        // if the objective is not reached, then ask a question to the assistant
        // i could add new context why it was not reach, in this case i could have another model that reasons and summarise why the objective was not reach
        if(isFirstMessage){
          lastQuestion = await generateAndSendQuestion(lastAnswersRawText, setMessage, sendMessage);
         
        }else{
        lastQuestion = await generateAndSendQuestion(lastAnswersRawText, setMessage, sendMessage);
        
        }
        markQuestion(lastQuestion);
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
      lasAnswersElements = await captureNewMessages("", '', 2000, chatbotInterface!);
      markResponses(lasAnswersElements);
      console.log("New messages", lasAnswersElements);
      // encapsulate the HTMLElement in a parent element
      
      lastAnswersRawCode = lasAnswersElements.map((element) => element.outerHTML).join("\n");
      lastAnswersRawText = normalizeText(lasAnswersElements.map((element) => element.textContent).join("\n"));
      if(isFirstMessage){
       isFirstMessage = false;
      }
    }
  });
}



/**  function to get the next objective prompts
 * 
 * @returns the next objective prompts
 */
export async function getNextObjectivePrompts(objectives: ObjectivesMap, chosenObjective?: Objective): Promise<ObjectiveDirectives> {
  let selectedObjective: Objective | undefined;

  if (chosenObjective && objectives[chosenObjective]) {
    // If the chosen objective is valid, use it
    selectedObjective = chosenObjective;
  } else {
    // Otherwise, select the next available objective
    const objectiveKeys = Object.keys(objectives);
    if (objectiveKeys.length === 0) {
      throw new Error("No objectives available to select.");
    }
    selectedObjective = objectiveKeys[0] as Objective;
  }

  const objectiveDirectives = getObjectiveDirectivesByKey(selectedObjective, objectives);

  // Update the current objective and remove it from the list
  currentObjective = objectives[selectedObjective];
  delete objectives[selectedObjective];

  return objectiveDirectives;
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

