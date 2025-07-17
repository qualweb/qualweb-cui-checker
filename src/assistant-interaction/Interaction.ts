import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { initiateModel, ModelOptions } from "./models";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { prompDetectTypeMessage } from "./prompts/prompts"; 
import { RunnableSequence } from "@langchain/core/runnables";

import { prompAnalyseFirstMessage, promptSubjectAnalysisChatbot } from "./prompts/interactionPrompt";


export async function avaliateMessageType(assistantPreviousMSG:string,html: string): Promise<String> {
  // Clean the HTML content
  return new Promise(async (resolve, reject) => {
    try {
      

     // const response = await chainprompt.invoke({code:html,previousMessage:assistantPreviousMSG});

      const route = ( input :string) => {
        let json = JSON.parse(input);
        if (json.type === "message") {
          return "message";
        }
        if (json.type === "options") {
          return "options";
        }
        if (json.type === "interface") {
          return "interface";
        }else{
          return "message";
        }
  
      }; 
      const modelOptions:ModelOptions = {
        model: "mistral:7b-instruct",
        temperature: 0,
        numCtx:15000 ,
      }  
      const model = await initiateModel(modelOptions);
      let promptApplied = await prompDetectTypeMessage.partial({previousMessage:assistantPreviousMSG});
      const classificationChain = RunnableSequence.from([
      promptApplied,
      model,
      new StringOutputParser(),
      route
    ]);
    const response = await classificationChain.invoke({code:html});
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

export async function analyseDomainChatbot(initialContent:string): Promise<string> {
  const modelOptions:ModelOptions = {
    model: "llama3.1",
    temperature: 0,
    streaming: false,
  }  
  const model = await initiateModel(modelOptions);
  const promptApplied =await prompAnalyseFirstMessage.partial({input:initialContent});
  const analyseDomainChain = RunnableSequence.from([
    promptApplied,
    model,
    new StringOutputParser(),
  ]);
  const response = await analyseDomainChain.invoke({});

  return response;
  
}

export async function analyseServicesOfChatbot(domain:string): Promise<string> {
  const modelOptions:ModelOptions = {
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
  }  
  const model = await initiateModel(modelOptions);
  const promptApplied =await promptSubjectAnalysisChatbot.partial({chatbot_title:domain});
  const analyseDomainChain = RunnableSequence.from([
    promptApplied,
    model,
    new StringOutputParser(),
  ]);
  const response = await analyseDomainChain.invoke({});

  return response;
  
}