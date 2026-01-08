import { LLM_Settings } from '../../utils/types';
import { initiateLangraphSettings } from './langgraph-orchestrator';
class AgentOrchestrator {
 
  private interactionGraph: any;

 
  public init( settings: LLM_Settings,isSpeechTestsEnabled:boolean) {
    this.interactionGraph = initiateLangraphSettings(settings, isSpeechTestsEnabled);

  }


 
  getGraph() {
    return this.interactionGraph;
  } 
  
  async destroy() {

      try {
        const graph = await this.interactionGraph;
        if (graph && typeof graph.shutdown === 'function') {
          await graph.shutdown();
        }
      } catch (err) {
        console.warn('Error destroying graph:', err);
      } finally {
        this.interactionGraph = null;
      }
    
  }

}

export default AgentOrchestrator;
