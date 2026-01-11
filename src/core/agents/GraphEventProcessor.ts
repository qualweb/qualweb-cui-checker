import { IQWGraphOutput } from "./domain/GraphOutput";
import { INTERRUPT_NODE_NAMES, NODE_COMPLETE_MAP, NODE_STATUS_MAP } from "./node-states";
export interface GraphAction {
  type: 'STATUS_UPDATE' | 'OBJECTIVE_UPDATE' | 'INTERRUPT' | 'FINAL_RESULT';
  payload: NodeState;
}

export interface NodeState {
  node: string;
  rule?: string;
  title?: string;
  status?: string;
  result?: IQWGraphOutput;
}
export class GraphEventProcessor {
public static parse(step: any): GraphAction | null {
    // if event is an interrupt
    if (step.event === 'interrupt' || INTERRUPT_NODE_NAMES.includes(step.name)) {
        const nodeStatus: NodeState = { node: step.name };
      return { type: 'INTERRUPT', payload: nodeStatus };
    }   

    // if event is start of a node
    if (step.event === 'on_chain_start') {
      const status = NODE_STATUS_MAP[step.name];
      if (status) {
        const nodeStatus: NodeState = { node: step.name, status };
        return { type: 'STATUS_UPDATE', payload: nodeStatus };
      }
    }

    // if event is end of a node
    if (step.event === 'on_chain_end') {
      if (step.name === 'objective_assigner' && step.data?.output?.currentObjective) {
        const nodeStatus: NodeState = {
          node: step.name,
          rule: step.data.output.currentObjective.check,
          title: step.data.output.currentObjective.title
        };
        return {
          type: 'OBJECTIVE_UPDATE',
          payload: nodeStatus
        };
      }

      // if event is end of LangGraph
      if (step.name === 'LangGraph' && step.data?.output?.graphOutput) {
        const nodeStatus: NodeState = {
          node: step.name,
          result: step.data.output.graphOutput as IQWGraphOutput
        };
        return { type: 'FINAL_RESULT', payload: nodeStatus };
      }
      
      // build status update for other nodes
      const status = NODE_COMPLETE_MAP[step.name];
      if (status) {
        const nodeStatus: NodeState = { node: step.name, status };
        return { type: 'STATUS_UPDATE', payload: nodeStatus };
      }
    }

    return null; 
  }
}
