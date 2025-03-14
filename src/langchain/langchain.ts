import { ChatOllama } from "@langchain/ollama";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { BufferMemory, BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ConversationSummaryMemory } from "langchain/memory";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";


//export const CHAT_HISTORY = new BufferWindowMemory({ k:5, memoryKey: "chat_history" }) ;
export const CHAT_HISTORY = new BufferMemory({ returnMessages: true, memoryKey: "chat_history" }) ;
export const LONG_MEMORY_CONTEXT= new ConversationSummaryMemory({
  llm: new ChatOllama({ model: "llama3.1", temperature: 0 }), 
  memoryKey: "memoryContext",
});

type OllamaModel = "mistral:7b-instruct"| "tinyllama" |"llama3"|"mistral"|"mistral-nemo"|"llama3.1"; 
interface LLMOrchestrator {
  llm: ChatOllama;
  memory: BufferMemory;
  conversationChain: ConversationChain;
}

export async function initiateModel(model:OllamaModel,temp:number): Promise<ChatOllama> {
  return new Promise( async (resolve, reject) => {
  let ollama = new ChatOllama({
    model: model,
    temperature : temp,
  });

  
  resolve(ollama);
} );
}

export async function invokeDirectMessageOllama(model:OllamaModel,messages:BaseLanguageModelInput,temp:number): Promise<string> {
  return new Promise((resolve, reject) => {
    let ollama = new ChatOllama({
    
      model: model,
      streaming: false,
      temperature : temp,
    });
  
    ollama.invoke(messages).then((result) => {
      resolve(JSON.stringify(result.content));
    }).catch((error) => {
      reject(error);
    });  
  });
}


export async function invokeModelWithoutMemoryOllama(model:OllamaModel,context:string,message:string,temp:number): Promise<ChatOllama> {
  return new Promise((resolve, reject) => {
    let ollama = new ChatOllama({
    
      model: model,
      streaming: false,
      temperature : temp,
    });
    const prompt = ChatPromptTemplate.fromTemplate(`${context} 
                  HTML code : ${message}  ` );
                                
    return ollama;
  });


}



export async function InvokeModelWithMemory(model:OllamaModel,context:string,temp:number): Promise<ConversationChain> {
  return new Promise( async (resolve, reject) => {
  let ollama = new ChatOllama({
  
    model: model,

    temperature : temp,
  });
  const chatPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      context ,
      
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
  ]);

// Add messages to memory


// Create conversation chain
/*
const chain = new ConversationChain({ 
  llm: ollama,
  prompt: chatPrompt,
  memory:  new BufferMemory({ returnMessages: true, memoryKey: "history" }) });
  */
  const chain = new ConversationChain({ 
    llm: ollama,
    prompt: chatPrompt,
    memory:  CHAT_HISTORY});
resolve(chain);

} );
}


async function chatWithMemory(chain:ConversationChain,input: string) {
  const response = await chain.call({ input });
  
  return response;
}

async function clearMemory(orchestrator:LLMOrchestrator) {
  await orchestrator.memory.clear();
} 