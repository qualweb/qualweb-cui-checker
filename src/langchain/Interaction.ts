import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { initiateModel, invokeDirectMessageOllama, InvokeModelWithMemory, invokeModelWithoutMemoryOllama } from "./langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { prompDetectTypeMessage } from "./prompts";

import { AIMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
interface IQuestion {
  question: string|null;
  options: string|null;
}

export async function avaliateMessageType(assistantPreviousMSG:string,html: string): Promise<String> {
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
      const model = await initiateModel("mistral:7b-instruct", 0);
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