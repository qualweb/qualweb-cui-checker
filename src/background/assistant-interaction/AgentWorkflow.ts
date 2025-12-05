import { LLM_Settings } from '../../utils/types';
import { initiateLangraphSettings } from './graph';
class AgentWorkflow {
  private static _instance: AgentWorkflow | null = null;

  private interactionGraph: any;

  private constructor(interactionGraph: any) {
    this.interactionGraph = interactionGraph;
  }

  static getInstance(settings: LLM_Settings): AgentWorkflow {
    if (this._instance) {
      return this._instance;
    }
    const graph = initiateLangraphSettings(settings);

    this._instance = new AgentWorkflow(graph);

    return this._instance;
  }

  async destroy() {
    if (this.interactionGraph) {
      try {
        const graph = await this.interactionGraph;
        if (graph && typeof graph.shutdown === 'function') {
          await graph.shutdown();
        }
      } catch (err) {
        console.warn('Error destroying graph:', err);
      } finally {
        this.interactionGraph = null;
        AgentWorkflow._instance = null;
      }
    }
  }

  getGraph() {
    return this.interactionGraph;
  }
}

export default AgentWorkflow;
