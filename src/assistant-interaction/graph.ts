import { MemorySaver } from '@langchain/langgraph/web';
import { LLM_Settings } from '../utils/types';
import { workflow } from './workflow';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

export const Settings: LLM_Settings = {
  model: 'gpt-4o',
  apiKey: null,
  apiURL: 'https://api.openai.com/v1',
  LLMService: 'openai',
  locale:""
};
export let LLM:ChatOpenAI;

export async function initiateLangraphSettings(settings: LLM_Settings) {
  
  Settings.apiKey = settings.apiKey;
  Settings.LLMService = settings.LLMService;
  Settings.locale = settings.locale;
  if (settings.LLMService !== 'openai') {
  LLM = new ChatOpenAI({
      apiKey: settings.apiKey!,
    });
  } else {
  LLM = new ChatOpenAI({
      apiKey: settings.apiKey!,
    });
  }
  return workflow.compile({
    checkpointer: new MemorySaver(),
  });
}



