import { GraphState } from "../state";
import { SystemMessage } from "@langchain/core/messages";
import {  STATUS_GRAPH } from "../domain/types";
import { LLM, Settings } from '../langgraph-orchestrator';
import { QuestionGenerationObjective } from "../domain/ObjectiveBuilder";
import { GraphOutputAction, IQWGraphOutput } from "../domain/GraphOutput/types";
import QuestionAction from "../domain/GraphOutput/actions/QuestionAction";

export const callQuestionFormulator = async (
  state: typeof GraphState.State,
) => {
  const {  strategy, importantContext,graphOutput } = state;
  const currentObjective = state.currentObjective as QuestionGenerationObjective;
  
  LLM.model = "gpt-4o";
  LLM.temperature = 0.1;
  LLM.topP = 1;
  LLM.frequencyPenalty = 0.3;
  LLM.presencePenalty = 0.3;
  LLM.maxTokens = 150;
  LLM.n = 1;

  const systemMessage = preparePrompt(
    strategy!,
    currentObjective,
    importantContext,
  );

  const result = await LLM.invoke([systemMessage]);
  //Revert options for LLM
  LLM.topP = undefined;
  LLM.frequencyPenalty = undefined;
  LLM.presencePenalty = undefined;
  LLM.maxTokens = undefined;
  LLM.n = undefined;
  
  const question_action = new QuestionAction(result.text.trim()).toJSON() as GraphOutputAction;
  
  const updateOutput:IQWGraphOutput = {
    ...graphOutput,
    status: STATUS_GRAPH.IN_PROGRESS,
    actions: [...(graphOutput?.actions || []), question_action],
  };

  return {
    currentObjectiveMessages: result,
    messages: [result],
    graphOutput: updateOutput,
    strategy: null,
  };
};

function preparePrompt(
  strategy: string ,
  currentObjective: QuestionGenerationObjective,
  importantContext: string[],
) {
  return new SystemMessage(`
    Task:
    Using the provided Strategy, formulate a short and precise question that will help achieve the Objective. 
    Apply the Strategy to the Knowledge Base when creating the question.

    Strategy: ${strategy}


    Objective: ${currentObjective.objective}
      ${currentObjective.requirements ? `Requirements: "${currentObjective.requirements}"\n` : ""}
    Knowledge Base: ${importantContext.join(", ")}
    
    Guidance of Types of Chatbots:
    - If the **rule-based** or  **intent-based**, focus on  short questions focusing in keywords that can be answered with predefined responses.
    - If the chatbot is a **task-oriented** bot, formulate questions that help gather specific information needed to complete tasks.
    - If the chatbot is a **llm**, create questions that can be answered using its knowledge base.
    - If the chatbot is a **llm-agent** bot, design questions that encourage detailed and informative responses.

    Instructions:
    - Formulate a question that follows the Strategy.
    - Ensure the generated questions align with the **Chatbot Type** and respect its limitations, ensuring the chatbot can accurately comprehend and respond.
    - The question should help gather necessary information to achieve the Objective.
    - Make it very simple, clear, and specific.
    - Do not add any extra information or context, just the question.
    - Ensure the assistant can answer it directly.
    - Write the question in  ${Settings.locale}.
    - Keep the question concise and focused.
    ${
      currentObjective?.requirements
        ? `- The Requirements indicate the type of answer your question should elicit.`
        : ""
    }
`);
}
