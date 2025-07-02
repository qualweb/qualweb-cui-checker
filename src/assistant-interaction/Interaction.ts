import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { initiateModel, ModelOptions } from "./models";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { prompDetectTypeMessage } from "./prompts/prompts"; 
import { RunnableSequence } from "@langchain/core/runnables";

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
      const modelOptions:ModelOptions = {
        model: "mistral:7b-instruct",
        temperature: 0,
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