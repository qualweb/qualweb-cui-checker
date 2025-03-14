import { Runnable, RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables";
import { ChatBotInterface } from "../utils/types";
import { CHAT_HISTORY, initiateModel, LONG_MEMORY_CONTEXT } from "../langchain/langchain";
import * as Prompt from "./prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatbotInterface } from "../content/Detection";
import { avaliateMessageType } from "./Interaction";
import { chooseOptionForObjective, evaluatorMetricsObjective, evaluatorObjective, extractOptions, generateQuestionChainConversation } from "./evaluator";
import { ConversationChain } from "langchain/chains";
import { OBJECTIVES } from "./objectives";

interface ChainObjective {
  ChainCheckObjectiveReached: Runnable;
  ChainGenerateQuestionForObjective: ConversationChain;
  ChainChooseBestOptionForObjective: Runnable;
}


export async function start(setMessage:(message:string)=>Promise<void>,sendMessage:()=>Promise<void>,captureNewMessages:( message: string,
  check: string,
  maxWaitTime:number,
  chatbotInterface?: ChatBotInterface)=>Promise<HTMLElement[]>): Promise<String> {
  return new Promise(async (resolve, reject) => {
    const model = await initiateModel("mistral:7b-instruct", 0);
    let request = "";
    const pipeline = new RunnablePassthrough().pipe(async (input)=>
    {
      const memoryData = await CHAT_HISTORY.loadMemoryVariables({});
      console.log("MemoryData:", memoryData);
      return { ...input, ...memoryData };
    }).pipe(async (input) => {
      let chain =  Prompt.promptGetServices.pipe(model).pipe(new StringOutputParser());
      const response = await chain.stream({message: request});
      let responseText = "";
      for await (const chunk of response) {
        await setMessage(chunk);
        responseText += chunk;
      }
      await sendMessage();
      let chatbotAnsweerHTML = await captureNewMessages(responseText, '', 2000, chatbotInterface!) 
      await CHAT_HISTORY.saveContext({ input: input.request }, { output: responseText })
     
      request = Array.from(chatbotAnsweerHTML).map((element) => element.textContent).join("\n");

      
  }) 
  
  await pipeline.invoke({request: request});
  });
}
let chainObjective:ChainObjective|null = null;

async function initChainNextObjective(){
  let objective:string = getNextObjective();

   chainObjective = {

    ChainCheckObjectiveReached: await evaluatorMetricsObjective(objective),
    ChainGenerateQuestionForObjective: await generateQuestionChainConversation(objective),
    ChainChooseBestOptionForObjective: await chooseOptionForObjective(objective),
  }
}
  export async function initalPipeline(initialMsg:HTMLElement[],setMessage:(message:string)=>Promise<void>,sendMessage:()=>Promise<void>,captureNewMessages:( message: string,
    check: string,
    maxWaitTime:number,
    chatbotInterface?: ChatBotInterface)=>Promise<HTMLElement[]>): Promise<string> {
      
      // initial message
      let lasAnswersElements:HTMLElement[] = initialMsg;

      let lastAnswersRawCode:string = initialMsg.map((element) => element.outerHTML).join("\n");

      let lastAnswersRawText:string = initialMsg.map((element) => element.textContent).join("\n");
      // encapsulate the HTMLElement in a parent element
      let lasQuestion = "**No question made yet**";
      // initial phase boolean
      let initialPhase = true;
      initChainNextObjective();
    
    return new Promise(async (resolve, reject) => {
      
      while(true){
        // initiate chains

        
        // is the initial cycle, meaning there is no need to wait for new messages?
        if(!initialPhase){
          // TODO : Pass the previous message to the pipeline 
          lasAnswersElements = await captureNewMessages("", '', 2000, chatbotInterface!)
          // encapsulate the HTMLElement in a parent element
          lastAnswersRawCode = lasAnswersElements.map((element) => element.outerHTML).join("\n");
          lastAnswersRawText = lasAnswersElements.map((element) => element.textContent).join("\n");
        }

        const chainType = await avaliateMessageType("",lastAnswersRawCode);
        
        console.log("Message type" ,chainType);
        if(chainType === "message"){
         //   let AssistanAIResponse = `The objective was: ${OBJECTIVES[indexOfObjective]}. The answer was: ${lastAnswersRawText}.`;
        //  await LONG_MEMORY_CONTEXT.saveContext({ input: AssistanAIResponse }, { output: "Reasoning updated with new insights." });
        
          let summary = await LONG_MEMORY_CONTEXT.loadMemoryVariables({});
          console.log("Summary",summary);
         // await CHAT_HISTORY.saveContext({ input: summary }, { output: "Reasoning updated with new insights." });
          // does the message already reach the objective?

          let response = await chainObjective!.ChainCheckObjectiveReached.invoke({
                                                                                objectiveLLM:OBJECTIVES[indexOfObjective],
                                                                                questionLLM:lasQuestion,
                                                                                answer:lastAnswersRawText});
    
          console.log("Is the objective reach?",response);

          if (response.confidence > 70) {
            // if the objective is reached, then the conversation is over
            await initChainNextObjective();
            if(indexOfObjective === OBJECTIVES.length){
              indexOfObjective = 0;
              break;
            }
          }
       /*   let AssistanAIResponse = `The objective was: ${OBJECTIVES[indexOfObjective]}. The answer was: ${lastAnswersRawText}, and 
          it was determined that the objective reach result was:${response}.`;
          await LONG_MEMORY_CONTEXT.saveContext({ input: AssistanAIResponse }, { output: "Reasoning updated with new insights." });
          */
        //  await CHAT_HISTORY.saveContext({ input: summary }, { output: "Summary updated with new insights." });
            // if the objective is not reached, then ask a question to the assistant
            // i could add new context why it was not reach, in this case i could have another model that reasons and summarise why the objective was not reach
            let question = await chainObjective!.ChainGenerateQuestionForObjective.invoke({input:lastAnswersRawText});

            let questionText = question.response;
            console.log(questionText);
            lasQuestion = questionText;
            await setMessage(questionText);
            await sendMessage();
            initialPhase = false;
            // send the question to the assistant
        
          
          

          
        }
        if(chainType === "options"){
          console.log("Options");
          console.log(lastAnswersRawCode);
          let options = await extractOptions(lastAnswersRawCode);
          console.log("Options",options);

          console.log("Options Available",options);
          let question = options.question;
          let context =  "" ;
          options.options.map((element) => {
            console.log(element)
            context +=  `\"${element}\",`;
          });
          console.log("Context",context);
          let bestOption = await chainObjective!.ChainChooseBestOptionForObjective.invoke({message:lasQuestion,question:question,options:context});
          console.log(bestOption);
          clickOnOption(bestOption.content,lasAnswersElements);
      
        }
        if(chainType === "interface"){
          console.log("Interface");

          
        }
      }
    });
}

let indexOfObjective = 0;
function getNextObjective():string{
  let objective =  OBJECTIVES[indexOfObjective];
  indexOfObjective++;
  return objective;
}

function clickOnOption(option:string,lasAnswersElements:HTMLElement[]){
  for (let i = lasAnswersElements.length-1; i >= 0 ; i--) {
    console.log("Element",lasAnswersElements[i]);
    let element = lasAnswersElements[i];
   // const xpath = `//*[text()='${option}']`;
   const xpath = `//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = '${option.toLowerCase().trim()}']`;
    const elementFound = document.evaluate(xpath, element, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null;
    if (elementFound) {
      console.log("Element found",elementFound);
      elementFound.click();
      break;
    }
  }
}

/*
function clickOnOption(option:string,lasAnswersElements:HTMLElement[]){
  let found = false;
  for (let elementAnswer of lasAnswersElements) {
    let  elements = elementAnswer.querySelectorAll('*'); 
    for (let element of elements) {
      
      if ((element as HTMLElement).innerText?.toLowerCase().includes(option.toLowerCase().trim())) {
        (element as HTMLElement).click();
        console.log("Element found",element);
        found = true;
        break;
      } 
      if(found){
        break;
      }

    }
 
    
  }
}*/