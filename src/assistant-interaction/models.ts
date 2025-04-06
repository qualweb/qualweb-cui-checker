import { ChatOllama } from "@langchain/ollama";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ConversationSummaryMemory } from "langchain/memory";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";


//export const CHAT_HISTORY = new BufferWindowMemory({ k:5, memoryKey: "chat_history" }) ;
export const CHAT_HISTORY = new BufferMemory({ returnMessages: true, memoryKey: "chat_history" }) ;

export const LONG_MEMORY_CONTEXT= new ConversationSummaryMemory({
  llm: new ChatOllama({ model: "llama3.1", temperature: 0 }), 
  memoryKey: "memoryContext",
});

type OllamaModel = "mistral:7b-instruct"| "tinyllama" |"llama3"|"mistral"|"mistral-nemo"|"llama3.1"; 

export interface ModelOptions {
  model: OllamaModel;
  temperature?: number;
  numCtx?: number;
  streaming?: boolean;
}

export async function initiateModel(modelOptions:ModelOptions): Promise<ChatOllama> {
  return new Promise( async (resolve, reject) => {
  let ollama = new ChatOllama({
   ...modelOptions
  });

  
  resolve(ollama);
} );
}

export async function invokeDirectMessageOllama(modelOptions:ModelOptions,messages:BaseLanguageModelInput): Promise<string> {
  return new Promise((resolve, reject) => {
    let ollama = new ChatOllama({
      ...modelOptions,
    });
  
    ollama.invoke(messages).then((result) => {
      resolve(JSON.stringify(result.content));
    }).catch((error) => {
      reject(error);
    });  
  });
}

export async function InvokeModelWithMemory(modelOptions:ModelOptions,context:string): Promise<ConversationChain> {
  return new Promise( async (resolve, reject) => {
  let ollama = new ChatOllama({
    ...modelOptions
  });
  const chatPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      context ,
      
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);


  const chain = new ConversationChain({ 
    llm: ollama,
    prompt: chatPrompt,
    memory:  CHAT_HISTORY});
resolve(chain);

} );
}

