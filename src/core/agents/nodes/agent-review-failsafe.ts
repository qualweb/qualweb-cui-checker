import { GraphState } from '../state';
import { LLM } from '../langgraph-orchestrator';
import TestRegistry from '../domain/QWTests/TestRegistry';
import QWBrowserTest from '../domain/QWTests/QWBrowserTest';
import QWStandardTest from '../domain/QWTests/QWStandardTest';

/**
 *
 * @param state
 * @returns
 */
export const agentReviewer = async (state: typeof GraphState.State) => {
  const { messages, currentObjective } = state;

  const obj = TestRegistry.deserialize(currentObjective!);

  LLM.model = 'gpt-4o';
  LLM.temperature = 0.5;
  LLM.topP = 0.5;
  LLM.frequencyPenalty = 0.7;
  LLM.presencePenalty = 0.6;

  const systemMessage = preparePrompt(
    obj as QWBrowserTest | QWStandardTest,
    state.importantContext || [],
  );

  const result = await LLM.invoke([systemMessage, ...messages]);
  return { messages: [result] };
};

function preparePrompt(currentObjective: QWBrowserTest | QWStandardTest, importantContext: any) {
  return {
    role: 'system',
    content: `
  You are a AI Agent that analyses messages of another assistant AI, based on last message you should make a strategy to pass to another agent for a question formulation.

  objective: "${currentObjective?.getObjective() || ''}".
  Important context: ${importantContext.join(', ')}.

  Based on the messages in the conversation history, you should:
  - Questions should be indirect and based on the context of the conversation with the objective in mind.
  - Do not repeat strategies that were already used.
  - Acronyms and terms contained in Important Context should be used.
  - Analyze the context and information provided.
  - Avoid strategies about software actualizations or history of platforms or other security sensitive information. 
  - Dont provide possible questions just plane strategy for objective
`,
  };
}
