import { GraphState } from "../state";
import { AIMessageChunk, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { LLM } from "../langgraph-orchestrator";
import { TypeTestOutcome, TEST_OUTCOME } from "../domain/QWTests/browser-tests/BrowserTest";
import QWRecognitionTest from "../domain/QWTests/QWRecognitionTest";
import TestRegistry from "../domain/QWTests/TestRegistry";
import { ACTION_TYPE, IQWGraphOutput } from "../domain/GraphOutput/types";
import { STATUS_GRAPH, STATUS_TEST } from "../domain/types";
import { ObjectiveSerialized } from "../domain/ObjectiveBuilder";


/**
 *
 * @param state
 * @returns
 */
export const QwSpeechRecognitionTestNode = async (state: typeof GraphState.State) => {
  const { currentObjective,objectives } = state;
  // TODO: Verify logic on null currentObjective
  if(!currentObjective) {
    return { status: STATUS_GRAPH.COMPLETED };
  }

  const qualwebTest = TestRegistry.deserialize(currentObjective);
  if (!(qualwebTest instanceof QWRecognitionTest)) {
    throw new Error("Current objective is not a QWRecognitionTest");
  }

  const lastMessage = qualwebTest.getTest().getChatbotResponse();




  LLM.model = "gpt-4o";
  LLM.temperature = 0;

  const humanMessage = new HumanMessage({
    content: lastMessage || "",
        });
  const systemMessage = preparePrompt(qualwebTest);

  const result = await LLM.invoke([systemMessage, humanMessage]);
  const outcome:TypeTestOutcome = testResultExtractorLLMResponse(result);
  const graphOutputUpdate:IQWGraphOutput = addResultToOutputEvaluation(qualwebTest, outcome);
  
  qualwebTest.setStatus(STATUS_TEST.COMPLETED);
  objectives[qualwebTest.getSelector()] = qualwebTest.toJSON() as ObjectiveSerialized;
  return {
    graphOutput: graphOutputUpdate,
    currentObjective: null ,
    objectives: objectives,
  };

};


  function testResultExtractorLLMResponse(result:AIMessageChunk, ): TypeTestOutcome {
    let outcomeResult: TypeTestOutcome = TEST_OUTCOME.INAPPLICABLE;
    try {
      const parsed = JSON.parse(result.content as string);
      outcomeResult = parsed.outcome;
      return outcomeResult;
    } catch {
      // fallback se o modelo não devolver JSON válido
      const content = String(result.content).toLowerCase();
      if (content.includes("passed")) {
        outcomeResult = "passed";
      } else if (content.includes("failed")) {
        outcomeResult = "failed";
      } else if (content.includes("warning")) {
        outcomeResult = "warning";
      } else {
        outcomeResult = "inapplicable";
      }
       return outcomeResult;
    }
   
};

function addResultToOutputEvaluation(currentObjective: QWRecognitionTest, outcome: TypeTestOutcome): IQWGraphOutput {
   const finalOutputEvaluation: IQWGraphOutput = {
      status: STATUS_GRAPH.IN_PROGRESS,
      actions: [{
        _type: ACTION_TYPE.MARK_ELEMENT_ACTION,
        check: currentObjective.getCheck(),
        selector: currentObjective.getSelector()
            },
          {
            _type: ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION,
            check: currentObjective.getCheck(),
            selector: currentObjective.getSelector(),
            outcome: outcome,
          }],
    };
    return finalOutputEvaluation;
  }
   
function preparePrompt(currentObjective: QWRecognitionTest) {
  return {
    role: "system",
    content: `
        Evaluate a chatbot’s spoken response (captured via transcript) after it listened to an audio played into its microphone, and classify the response according to predefined evaluation rules.
        The only possible outcomes are "passed", "failed", "warning", and "inapplicable".

        Transcript: ${currentObjective.getTest().getTranscript()}

        Expected Response: ${currentObjective.getTest().getExpectedResponse()}

        *** Rules of Evaluation:
        ${
          currentObjective.getTest().getConditionsDescription()
        }
        ***

        Instructions:
        - Return ONLY a valid JSON object. Example: {"outcome": "passed"}
        - Allowed values for "outcome": "passed", "failed", "warning", "inapplicable"
        - No additional text, explanation, or comments.
        `,
  };
}
