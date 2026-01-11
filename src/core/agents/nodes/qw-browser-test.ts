import { GraphState } from '../state';
import { AIMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { LLM, Settings } from '../langgraph-orchestrator';
import { TypeTestOutcome, TEST_OUTCOME } from '../domain/QWTests/browser-tests/BrowserTest';
import TestRegistry from '../domain/QWTests/TestRegistry';
import QWBrowserTest from '../domain/QWTests/QWBrowserTest';
import { STATUS_GRAPH, STATUS_TEST } from '../domain/types';
import { ObjectiveSerialized } from '../domain/ObjectiveBuilder';
import { ACTION_TYPE, IQWGraphOutput } from '../domain/GraphOutput/types';

/**
 *
 * @param state
 * @returns
 */
export const QwBrowserTest = async (state: typeof GraphState.State) => {
  const currentObjective = state.currentObjective;
  const { objectives, graphOutput } = state;
  if (!currentObjective) {
    return { status: STATUS_GRAPH.COMPLETED };
  }

  const qwTest = TestRegistry.deserialize(currentObjective);
  if (!(qwTest instanceof QWBrowserTest)) {
    throw new Error('Current objective is not a QWBrowserTest');
  }

  const lastMessage = qwTest.getTest().getChatbotResponse();

  LLM.model = 'gpt-4o';
  LLM.temperature = 0;

  const humanMessage = new HumanMessage({
    content: lastMessage || '',
  });

  const systemMessage = preparePrompt(qwTest);

  const result = await LLM.invoke([systemMessage, humanMessage]);
  const outcome: TypeTestOutcome = testResultExtractorLLMResponse(result);
  const graphOutputUpdate = addResultToOutputEvaluation(qwTest, outcome, graphOutput);

  const newContext = await addInformationOnContextImportantObjectives(
    qwTest,
    humanMessage,
    outcome,
  );

  qwTest.setStatus(STATUS_TEST.COMPLETED);

  objectives[qwTest.getSelector()] = qwTest.toJSON() as ObjectiveSerialized;
  let objectivesUpdated: Record<string, ObjectiveSerialized> = {
    ...objectives,
    [qwTest.getSelector()]: qwTest.toJSON() as ObjectiveSerialized,
  };

  const isCompleteAll = Object.values(objectivesUpdated).every(
    (obj) => obj.status === STATUS_TEST.COMPLETED || obj.status === STATUS_TEST.FAILED,
  );

  return {
    graphOutput: graphOutputUpdate,
    currentObjective: null,
    objectives: objectivesUpdated,
    importantContext: newContext ? [newContext.content] : [],
    status: isCompleteAll ? STATUS_GRAPH.COMPLETED : STATUS_GRAPH.IN_PROGRESS,
  };
};

async function addInformationOnContextImportantObjectives(
  currentObjective: QWBrowserTest,
  humanMessage: HumanMessage,
  outcomeResult: TypeTestOutcome,
) {
  let response: AIMessageChunk | undefined;
  if (currentObjective.getCheck() === 'QW-CUI-C8') {
    if (outcomeResult === 'passed') {
      // adicionar services to important context
      LLM.model = 'gpt-4.1-nano';
      LLM.temperature = 0;

      const systemMessageServices = summaryPrompt;

      const response = await LLM.invoke([systemMessageServices, humanMessage]);

      return response;
    }
  }
  return response;
}

function testResultExtractorLLMResponse(result: AIMessageChunk): TypeTestOutcome {
  let outcomeResult: TypeTestOutcome = TEST_OUTCOME.INAPPLICABLE;
  try {
    const parsed = JSON.parse(result.content as string);
    outcomeResult = parsed.outcome;
    return outcomeResult;
  } catch {
    // fallback se o modelo não devolver JSON válido
    const content = String(result.content).toLowerCase();
    if (content.includes('passed')) {
      outcomeResult = 'passed';
    } else if (content.includes('failed')) {
      outcomeResult = 'failed';
    } else if (content.includes('warning')) {
      outcomeResult = 'warning';
    } else {
      outcomeResult = 'inapplicable';
    }
    return outcomeResult;
  }
}

function addResultToOutputEvaluation(
  currentObjective: QWBrowserTest,
  outcome: TypeTestOutcome,
  graphOutput?: IQWGraphOutput,
): IQWGraphOutput {
  const graphOutputUpdate: IQWGraphOutput = {
    status: graphOutput?.status || STATUS_GRAPH.IN_PROGRESS,
    actions: [
      ...(graphOutput?.actions || []),
      {
        _type: ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION,
        check: currentObjective.getCheck(),
        selector: currentObjective.getSelector(),
        outcome: outcome,
      },
    ],
  };

  return graphOutputUpdate;
}

function preparePrompt(currentObjective: QWBrowserTest) {
  return {
    role: 'system',
    content: `
        Task: Based on the Objective, analyse the following message and decide the outcome for this objective based on the Rules of evaluation.
        The only possible outcomes are "passed", "failed", "warning", and "inapplicable".

        Objective: ${currentObjective.getObjective()}

        *** Rules of Evaluation:
        ${currentObjective.getTest().getConditionsDescription()}
        ***

        Instructions:
        - Return ONLY a valid JSON object. Example: {"outcome": "passed"}
        - Allowed values for "outcome": "passed", "failed", "warning", "inapplicable"
        - No additional text, explanation, or comments.
        `,
  };
}

const summaryPrompt = {
  role: 'system',
  content: `Task: Extract key information from the given text, focusing on important topics or services mentioned.

        Instructions:
        - Identify all relevant services, topics, or key information mentioned in the text.
        - Organize the output as a clear, concise list or short summary.
        - Do NOT generate extra commentary, explanations, or unrelated content.
        - Keep output in language of ( ${Settings?.locale || 'en-US'}), plain text only.
        - Be concise and precise.`,
};
