import { PromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { initiateModel, InvokeModelWithMemory, ModelOptions } from "./models";
import { ConversationChain } from "langchain/chains";
import { promptChooseOption, promptExtractOptions } from "./prompts/prompts";
import { StructuredOutputParser, OutputFixingParser } from "langchain/output_parsers";
import { z } from "zod";


export const evaluatorMetricsObjective = async (template:PromptTemplate): Promise<Runnable> => { 
   const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      status: z.string(),
      confidence: z.number(),
    })
  );
  const formatInstructions = parser.getFormatInstructions();
  const llmOptions:ModelOptions = {
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
  };
  const ollama = await initiateModel(llmOptions);
   
   let promptPartial = await template.partial({formatInstructions:formatInstructions});
   let modelEvaluator = promptPartial.pipe(ollama).pipe(parser);

   return modelEvaluator;
 
}

/** 
 * 
 * @param template template must accept parameter objectiveLLM 
 * @param objectiveLLM Objective of the LLM
 * @returns 
 */
export const generateQuestionChainConversation = async (template:PromptTemplate): Promise<ConversationChain> => {
   const prompt = await template.format({});
  const llmOptions:ModelOptions = {
      model: "llama3.1",
      temperature: 0.3,
      streaming: false,
    };
   const model = await InvokeModelWithMemory(llmOptions,prompt);

   return model;
 
}

interface QueryOptions{
  question:string;
  options:string[];
}
export const extractOptions = async (code:string): Promise<QueryOptions> => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      question: z.string(),
      options:  z.array(z.string()),
    })
  );
  const formatInstructions = parser.getFormatInstructions();
  let promptPartial = await promptExtractOptions.partial({formatInstructions:formatInstructions});
  const llmOptions:ModelOptions = {
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
  };
  const ollama = await initiateModel(llmOptions);
  let model =  promptPartial.pipe(ollama);
  
  let response = await model.invoke({code:code});
  
  const content = typeof response.content === "string" ? response.content : response.content?.toString()
  const parsedOutput = await parser.parse(content);

  return parsedOutput;  

  
}

export const chooseOptionForObjective = async (objective:string): Promise<Runnable> => {

  const promptChoose = await promptChooseOption.partial({objective:objective});
  const llmOptions:ModelOptions = {
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
  };
  const ollama = await initiateModel(llmOptions);

  return promptChoose.pipe(ollama);

  
}
