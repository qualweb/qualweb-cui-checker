import InputRegistry from '../domain/GraphInput/InputRegistry';
import { GraphState } from '../state';
import { INPUT_TYPE, TGraphInput } from '../domain/GraphInput/types';
import { extractText } from '../util';
import { STATUS_TEST } from '../domain';

/*
export const initialNode = async (state: typeof GraphState.State) => {
  // load next objective not completed
  const lastMessage = state.messages[state.messages.length -1];
  const jsonString = extractText(lastMessage.content);
  try{
    const parseInput = JSON.parse(jsonString);
    
     const input = InputRegistry.deserialize(parseInput);
    return { graphOutput: null, graphInput: input.toJSON() as TGraphInput };
  }catch(e){

    throw new Error("Failed to parse graph input: " + (e as Error).message);
  }
};
*/

export const initialNode = async (state: typeof GraphState.State) => {
  // load next objective not completed
  const lastMessage = state.messages[state.messages.length - 1];
  const { currentObjective, objectives } = state;

  const jsonString = extractText(lastMessage.content);
  try {
    console.log('Initial Node - extracted JSON string:', jsonString);
    const parseInput = JSON.parse(jsonString);
    if (parseInput._type === INPUT_TYPE.GRAPH_SKIP_OBJECTIVE_INPUT) {
      let updatedObjectives = objectives;
      let updatedCurrentObjective = currentObjective;
      if (updatedCurrentObjective) {
        updatedCurrentObjective.status = STATUS_TEST.FAILED;

        updatedObjectives = {
          ...objectives,
          [updatedCurrentObjective.selector]: updatedCurrentObjective,
        };
      }
      return {
        graphOutput: null,
        graphInput: { _type: INPUT_TYPE.GRAPH_BASE_INPUT, message: ' ' } as TGraphInput,
        currentObjective: null,
        objectives: updatedObjectives,
      };
    }

    const input = InputRegistry.deserialize(parseInput);
    return { graphOutput: null, graphInput: input.toJSON() as TGraphInput };
  } catch (e) {
    throw new Error('Failed to parse graph input: ' + (e as Error).message);
  }
};
