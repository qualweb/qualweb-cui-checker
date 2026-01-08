
import { IQWGraphOutput } from "../domain/GraphOutput/types";
import { GraphState } from "../state";

export const prepareOutputMessage = (state: typeof GraphState.State)=> {
  const { graphOutput,status } = state;

   const graphOutputUpdated:IQWGraphOutput = {
    ...graphOutput,
    status: status,
   };

  return {graphOutput: graphOutputUpdated };
};
