import { GraphState } from '../state';
import { LLM } from '../langgraph-orchestrator';
import { QuestionGenerationObjective } from '../domain/ObjectiveBuilder';

export const strategyFormulator = async (state: typeof GraphState.State) => {
  const { currentObjectiveMessages, importantContext } = state;
  const currentObjective = state.currentObjective as QuestionGenerationObjective;

  LLM.model = 'gpt-4o';
  LLM.temperature = 0;
  LLM.topP = 1;
  LLM.maxTokens = 100;
  LLM.n = 1;

  const systemMessage = generatePrompt(importantContext, currentObjective);
  const result = await LLM.invoke([systemMessage, ...currentObjectiveMessages]);
  //Revert options for LLM
  LLM.topP = undefined;
  LLM.maxTokens = undefined;
  LLM.n = undefined;

  return { strategy: result.content };
};
function generatePrompt(
  importantContext: string[],
  currentObjective: QuestionGenerationObjective | null,
) {
  return {
    role: 'system',
    content: `Define a short strategy to achieve the Objective, considering that previous attempts failed.

Knowledge Base: ${importantContext.join(', ')}
Objective: ${currentObjective?.objective}
${
  currentObjective?.requirements
    ? `Requirements:
${currentObjective.requirements}
- Note: Requirements describe the type or characteristics of the answers that the questions you will generate should aim to elicit. They guide the focus of your strategy without providing the exact answers.\n`
    : ''
}
Guidance of Types of Chatbots:
    - If the **rule-based** or  **intent-based**, focus on strategy for short questions focusing in keywords that can be answered with predefined responses.
    - If the chatbot is a **task-oriented** bot, strategy for  questions that help gather specific information needed to complete tasks.
    - If the chatbot is a **llm**, create strategy for questions that can be answered using its knowledge base.
    - If the chatbot is a **llm-agent** bot, design strategy for questions that encourage detailed and informative responses.


Context:
- ***All previous assistant messages represent questions that failed.***
- ***All previous user messages represent answers that failed.***
- ***Analyze these past messages to learn why they failed, but do NOT copy their specific content. Create a general approach that guides future questions.***
- ***If questions failed multiple times choose the most relevant domain/topic to achieve the Objective from Knowledge Base.***

Instructions:
- Focus on the Knowledge Base${currentObjective?.requirements ? ' and the Requirements' : ''}.
- Design the strategy so that generated questions align with the **Chatbot Type** and respect its limitations, ensuring the chatbot can accurately comprehend and respond.
- Prefer questions about publicly available information and general entity topics.
- Avoid questions requiring personal, contextual, or transactional data that the chatbot cannot handle.
- Phrase questions to solicit clear, objective, and standardized information.
- Avoid repeating errors detected in past messages.
- ***Output a strategy as plain text, describing an approach to generate questions, not direct answers.***
- Output only the strategy as plain text, maximum 2 lines (one line break allowed), no extra explanations.`,
  };
}
