import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { ChatOllama } from "@langchain/ollama";
import { InvokeModelWithMemory } from "./langchain";
import { ChainValues } from "@langchain/core/utils/types";
import { ConversationChain } from "langchain/chains";
import { promptChooseOption, promptExtractOptions } from "./prompts";
import { StructuredOutputParser, OutputFixingParser } from "langchain/output_parsers";
import { z } from "zod";
import { format } from "path";
let evaluatorPrompt = PromptTemplate.fromTemplate(`
  You are a Evaluator of a messages between a  and a human. your role is to determine is the objective of LLM was reach:

  
  Objective of the LLM:
  {objectiveLLM}

  Question of the LLM:
  {questionLLM}

  The answer of the human:
  {answer}


  Guidelines:
  You should answer  YES if the objective was reached and NO if the objective was not reach.
  No extra information or comments should be included in the answer.

`);

let confidenceLevelEvaluator = PromptTemplate.fromTemplate(`
  You are an AI agent that interacts with another chatbot to determine if the objective given was reached:

  
  Your Objective:
  {objectiveLLM}

  Your Question to the chatbot:
  {questionLLM}

  The answer of the chatbot:
  {answer}

  if the answer of chatbot contains the objective with a confidence level of 80 or higher you should.
  confidence should be a number between 0 and 100. Being 0 the lowest and 100 the highest.
  
  \`\`\`json
    {{
      "status": "completed",
      "confidence": <confidence_level>
    }}
    \`\`\`
  - Otherwise, return:
    \`\`\`json
    {{
      "status": "incomplete",
      "confidence": <confidence_level>
    }}
    \`\`\`
  

   Format instructions:
   {formatInstructions}
`);

let summaryEvaluatorPrompt = PromptTemplate.fromTemplate(`
  You are a Evaluator of a summary. your role is to determine is the objective was obtained in summary:

  
  Objective of the LLM:
  {objectiveLLM}

  Question of the LLM:
  {questionLLM}

  The summary of long conversation:
  {answer}


  Guidelines:
  You should answer  YES if the objective was reached and NO if the objective was not reach.
  No extra information or comments should be included in the answer.

`);
interface ObjectiveEvaluation{
  status:string;
  confidence:number;
}


export const evaluatorMetricsObjective = async (objectiveLLM: string): Promise<Runnable> => { 
   const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      status: z.string(),
      confidence: z.number(),
    })
  );
  const formatInstructions = parser.getFormatInstructions();
  const ollama = new ChatOllama({
     model: "mistral:7b-instruct",
     temperature: 0,
    
     streaming: false,
   });
   
   let promptPartial = await confidenceLevelEvaluator.partial({objectiveLLM:objectiveLLM,formatInstructions:formatInstructions});
   let modelEvaluator = promptPartial.pipe(ollama).pipe(parser);

   return modelEvaluator;
 
}

export const evaluatorObjective = async (objectiveLLM: string): Promise<Runnable> => {
     const ollama = new ChatOllama({
        model: "llama3.1",
        temperature: 0,
    
        streaming: false,
      });
      
      let promptPartial = await summaryEvaluatorPrompt.partial({objectiveLLM:objectiveLLM});
      let modelEvaluator = promptPartial.pipe(ollama).pipe(new StringOutputParser());

      return modelEvaluator;
    
}
let promptGetQuestion = PromptTemplate.fromTemplate(`
  You are an AI agent that interacts with another chatbot, Your role is to ask one concise question at a time to reach the objective:

  The objective of your question is:

  {objective}

  Task:
  Ask a question to achieve objective, you should not repeat question based on history of chat and you should used question based on the summary in your memory.
  To help you should use the knowledge you build of chatbot from the previous conversation.

  Guidelines:
  Reason with chat history and ask questions that will help you achieve the objective.
  Ask only one short, clear question at a time.
  Focus on the most relevant question based on the assistant's previous response.
  If needed, reformulate or move to a different question without repeating previous ones.
  No extra information or comments should be included in the question.
  Ask in the same language the chatbot is using.
`);


export const generateQuestionChainConversation = async (objectiveLLM: string): Promise<ConversationChain> => {
   const prompt = await promptGetQuestion.format({objective: objectiveLLM});
   const model = await InvokeModelWithMemory("llama3.1",prompt, 0.3);

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
      options: z.string().array(),
    })
  );
  const formatInstructions = parser.getFormatInstructions();
  let promptPartial = await promptExtractOptions.partial({formatInstructions:formatInstructions});
  const ollama = new ChatOllama({
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
  });
  let model =  promptPartial.pipe(ollama);
  
  let response = await model.invoke({code:code});
  
  const content = typeof response.content === "string" ? response.content : response.content?.toString()
  const parsedOutput = await parser.parse(content);

  return parsedOutput;  

  
}

export const chooseOptionForObjective = async (objective:string): Promise<Runnable> => {

  const promptChoose = await promptChooseOption.partial({objective:objective});
  const ollama = new ChatOllama({
    model: "mistral:7b-instruct",
    temperature: 0,
    streaming: false,
    numCtx: 2000
  });
  return promptChoose.pipe(ollama);

  
}
