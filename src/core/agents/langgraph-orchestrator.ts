import { MemorySaver } from '@langchain/langgraph/web';
import { LLM_Settings } from '../../utils/types';
import { workflow } from './workflow';
import { ChatOpenAI } from '@langchain/openai';
import { initCUISpeechRecognitionTests } from './state';

export const Settings: LLM_Settings = {
  apiKey: null,
  LLMService: 'openai',
  locale: '',
};
export let LLM: ChatOpenAI;

export function initiateLangraphSettings(settings: LLM_Settings, isSpeechTestsEnabled: boolean) {
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
  initCUISpeechRecognitionTests(isSpeechTestsEnabled);
  return workflow.compile({
    checkpointer: new MemorySaver(),
  });
}
