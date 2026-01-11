import { GraphState } from '../state';
import { LLM, Settings } from '../langgraph-orchestrator';

export const askAssistantForMoreInfo = async (state: typeof GraphState.State, input: any) => {
  const { messages } = state;
  const strategy = input.strategy;
  LLM.model = 'gpt-4o-mini';
  LLM.temperature = 0.5;
  LLM.topP = 0.5;
  LLM.frequencyPenalty = 0.7;
  LLM.presencePenalty = 0.6;
  const systemMessage = generatePrompt(strategy, state.currentObjective);
  const result = await LLM.invoke([systemMessage, ...messages]);
  //Revert options for LLM
  LLM.topP = undefined;
  LLM.frequencyPenalty = undefined;
  LLM.presencePenalty = undefined;

  return { messages: [result] };
};

function generatePrompt(strategy: any, currentObjective: any) {
  return {
    role: 'system',
    content: `Task: Based on the Strategy proposed and last messages, ask the assistant for more information about the services or help offered in relation to the entity to achieve the objective.
       Strategy: ${strategy}
       Objective: ${currentObjective?.objective || ''}
       Follow the instructions of Last message and make a short question for this in language Locale :  ${
         Settings.locale
       }.
      .`,
  };
}
