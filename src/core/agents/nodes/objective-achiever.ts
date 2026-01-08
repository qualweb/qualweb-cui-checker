import { GraphState } from "../state";
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import TestRegistry ,{ QWTestType } from "../domain/QWTests/TestRegistry";
import { LLM } from "../langgraph-orchestrator";
import QWBrowserTest from "../domain/QWTests/QWBrowserTest";
import QWStandardTest from "../domain/QWTests/QWStandardTest";
import QWRecognitionTest from "../domain/QWTests/QWRecognitionTest";
import { extractText } from "../util";
import { STATUS_GRAPH, STATUS_TEST } from "../domain/types";
import { ObjectiveSerialized } from "../domain/ObjectiveBuilder";
import { ACTION_TYPE, IQWGraphOutput } from "../domain/GraphOutput/types"
import InputRegistry from "../domain/GraphInput/InputRegistry";


/**
 *
 * @param state
 * @returns
 */
export const objectiveAchiever = async (state: typeof GraphState.State) => {
  const { objectives, currentObjective,
             graphOutput } = state;


  const graphInput = InputRegistry.deserialize(state.graphInput);
  const lastMessage = new HumanMessage(
    graphInput.getMessage()
  );
  let graphOutputUpdate: IQWGraphOutput = graphOutput;

  // if CurrentObjective does not exist
  if (!currentObjective) return { status: STATUS_GRAPH.COMPLETED };

  // instantiate test from registry
  const qwTest:QWTestType = TestRegistry.deserialize(
    currentObjective
  );
  
  if ( qwTest instanceof QWRecognitionTest){
    // send to QWRecognitionTest handler
      qwTest.getTest().setChatbotResponse(graphInput.getMessage());

     return {
      currentObjective: qwTest.toJSON() as ObjectiveSerialized,

     };
  }
  
  // else handle standard test

  LLM.model = "gpt-4o";
  LLM.temperature = 0;


  const systemMessage = preparePrompt(qwTest);

  const result = await LLM.invoke([systemMessage, lastMessage]);

  const objectiveAchieved = testResultExtractorLLMResponse(result);

  let currentObjectiveUpdate:ObjectiveSerialized | null = currentObjective;
  let currentObjectiveMessagesUpdate = [lastMessage];

  if (objectiveAchieved) {
    // mark objective as completed
    qwTest.setStatus(STATUS_TEST.COMPLETED);
     graphOutputUpdate = {
        ...graphOutput,
        actions: [...graphOutput?.actions || [], {
          _type: ACTION_TYPE.MARK_ELEMENT_ACTION,
          check: qwTest.getCheck(),
          selector: qwTest.getSelector(),
        }],
      };

    currentObjectiveMessagesUpdate = [];
    
    if(qwTest instanceof QWBrowserTest){
    
      qwTest.getTest().setChatbotResponse(extractText(lastMessage.content));
      currentObjectiveUpdate = qwTest.toJSON() as ObjectiveSerialized;
      

    }else if (qwTest instanceof QWStandardTest){
      // Standard test passed, mask as updated current objective to  null
      currentObjectiveUpdate =  null;

      // prepare graph output to next action                                            
    }

  }else{
    // Did not pass 

    // increment counter
    qwTest.incrementCounterExecution();
    if (qwTest.getCounterExecution() >= 3) {

      // mark objective as failed
      qwTest.setStatus(STATUS_TEST.FAILED);
      currentObjectiveUpdate = null;
      currentObjectiveMessagesUpdate = [];
    }
  }

    let objectivesUpdated: Record<string, ObjectiveSerialized> = {
      ...objectives,
      [qwTest.getSelector()]: qwTest.toJSON() as ObjectiveSerialized,
    };
    const isCompleteAll = Object.values(objectivesUpdated).every(
      (obj) => obj.status === STATUS_TEST.COMPLETED || obj.status === STATUS_TEST.FAILED,
    );

   return {
      objectives: objectivesUpdated,
      currentObjectiveMessages: currentObjectiveMessagesUpdate,
      currentObjective: currentObjectiveUpdate,
      graphOutput:graphOutputUpdate,
      status: isCompleteAll ? STATUS_GRAPH.COMPLETED : STATUS_GRAPH.IN_PROGRESS,
    };
    
};

function testResultExtractorLLMResponse(result:AIMessageChunk ): boolean {
     let isObjectiveAchieved: boolean = false;
    try {
      const parsed = JSON.parse(result.content as string);
       isObjectiveAchieved = !!parsed.achieved;
      return isObjectiveAchieved;
    } catch {
      // fallback se o modelo não devolver JSON válido
          isObjectiveAchieved = String(result.content).toLowerCase().includes("true");
          
          return isObjectiveAchieved;
    }
  
};
/**
 *
 * @param currentObjective
 * @returns
 */
function preparePrompt(currentObjective: QWStandardTest) {
  return {
    role: "system",
    content: `Task: Based on the Objective, analyse the following message and decide if the Objective is achieved.
       Objective: ${currentObjective.getObjective()}

       ${currentObjective.getRequirements() ? `Requirements: ${currentObjective.getRequirements()}` : ""}
       

       Instructions:
       - Return ONLY a valid JSON object.
       - Format: {"achieved": true} or {"achieved": false}
       - "achieved": true if the objective is achieved, false otherwise.
       - No aditional text or comments
        ${
          currentObjective?.getRequirements()
            ? `- The achieved result must be determined according to the provided Requirements.`
            : ""
        }`,
  };
}
