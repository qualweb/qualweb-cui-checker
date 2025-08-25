import { ChatOllama } from '@langchain/ollama';
import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { ConversationSummaryMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';

import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { LLM_Settings } from '../utils/types';

//export const CHAT_HISTORY = new BufferWindowMemory({ k:5, memoryKey: "chat_history" }) ;
export let CHAT_HISTORY = new BufferMemory({
  returnMessages: true,
  memoryKey: 'chat_history',
});
/*
export const LONG_MEMORY_CONTEXT= new ConversationSummaryMemory({
  llm: new ChatOllama({ model: "llama3.1", temperature: 0 }), 
  memoryKey: "memoryContext",
});
*/
const Settings: LLM_Settings = {
  LLMService: 'ollama',
  model: 'mistral:7b-instruct',
  apiURL: null,
  apiKey: null,
};

export async function initiateModelsSettings(settings: LLM_Settings) {
  // Get the model settings from the storage
  await CHAT_HISTORY.clear();

  Settings.LLMService = settings.LLMService;
  Settings.model = settings.model;
  Settings.apiURL = settings.apiURL;
  Settings.apiKey = settings.apiKey;
}

type ChatModelInstance = InstanceType<typeof ChatOpenAI> | InstanceType<typeof ChatOllama>;

interface ModelFactory {
  initiateModel: (options: ModelOptions) => Promise<ChatModelInstance>;
  initiateModelWithMemory: (options: ModelOptions, context: string) => Promise<ConversationChain>;
  invokeDirectMessage: (options: ModelOptions, messages: BaseLanguageModelInput) => Promise<string>;
}

const modelFactories: Record<string, ModelFactory> = {
  openai: {
    initiateModel: (options: ModelOptions) => initiateModelOpenAI(options),
    initiateModelWithMemory: (options: ModelOptions, context: string) =>
      InvokeModelWithMemoryOpenAI(options, context),
    invokeDirectMessage: (options: ModelOptions, messages: BaseLanguageModelInput) =>
      invokeDirectMessageOpenAI(options, messages),
  },
  ollama: {
    initiateModel: (options: ModelOptions) => initiateModel(options),
    initiateModelWithMemory: (options: ModelOptions, context: string) =>
      InvokeModelWithMemory(options, context),
    invokeDirectMessage: (options: ModelOptions, messages: BaseLanguageModelInput) =>
      invokeDirectMessageOllama(options, messages),
  },
};

type OllamaModel =
  | 'mistral:7b-instruct'
  | 'tinyllama'
  | 'llama3'
  | 'mistral'
  | 'mistral-nemo'
  | 'llama3.1'
  | 'llama3.1:8b-instruct-q8_0'
  | 'phi4';
type OpenAIModel = 'gpt-4.1';

export interface ModelOptions {
  model?: OllamaModel | OpenAIModel;
  temperature?: number;
  numCtx?: number;
  streaming?: boolean;
}

export function getModelFactory(): ModelFactory {
  const factory = modelFactories[Settings.LLMService];
  if (!factory) {
    throw new Error(`No model factory found for service: ${Settings.LLMService}`);
  }
  return factory;
}

export async function initiateModelOpenAI(modelOptions: ModelOptions): Promise<ChatOpenAI> {
  //TODO: Get a Elegant way to set the model options

  let modelOptionsFix: ModelOptions = modelOptions;
  modelOptionsFix.model = 'gpt-4.1';

  return new Promise(async (resolve, reject) => {
    let openAI = new ChatOpenAI({
      openAIApiKey: Settings.apiKey!,
      ...modelOptions,
    });

    resolve(openAI);
  });
}
export async function initiateModel(modelOptions: ModelOptions): Promise<ChatOllama> {
  return new Promise(async (resolve, reject) => {
    let ollama = new ChatOllama({
      ...modelOptions,
    });

    resolve(ollama);
  });
}

export async function invokeDirectMessageOpenAI(
  modelOptions: ModelOptions,
  messages: BaseLanguageModelInput,
): Promise<string> {
  let modelOptionsFix: ModelOptions = modelOptions;
  modelOptionsFix.model = 'gpt-4.1';
  return new Promise((resolve, reject) => {
    let openAI = new ChatOpenAI({
      openAIApiKey: Settings.apiKey!,
      ...modelOptionsFix,
    });

    openAI
      .invoke(messages)
      .then((result) => {
        resolve(JSON.stringify(result.content));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function InvokeModelWithMemoryOpenAI(
  modelOptions: ModelOptions,
  context: string,
): Promise<ConversationChain> {
  let modelOptionsFix: ModelOptions = modelOptions;
  modelOptionsFix.model = 'gpt-4.1';
  return new Promise(async (resolve, reject) => {
    let openAI = new ChatOpenAI({
      openAIApiKey: Settings.apiKey!,
      ...modelOptionsFix,
    });
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', context],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    const chain = new ConversationChain({
      llm: openAI,
      prompt: chatPrompt,
      memory: CHAT_HISTORY,
    });
    resolve(chain);
  });
}

export async function invokeDirectMessageOllama(
  modelOptions: ModelOptions,
  messages: BaseLanguageModelInput,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let ollama = new ChatOllama({
      ...modelOptions,
    });

    ollama
      .invoke(messages)
      .then((result) => {
        resolve(JSON.stringify(result.content));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function InvokeModelWithMemory(
  modelOptions: ModelOptions,
  context: string,
): Promise<ConversationChain> {
  return new Promise(async (resolve, reject) => {
    let ollama = new ChatOllama({
      ...modelOptions,
    });
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', context],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    const chain = new ConversationChain({
      llm: ollama,
      prompt: chatPrompt,
      memory: CHAT_HISTORY,
    });
    resolve(chain);
  });
}
