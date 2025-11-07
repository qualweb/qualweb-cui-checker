import { LLM_Settings } from '../../utils/types';
import { initiateLangraphSettings } from './graph';
class AgentWorkflow {
    private static _instance: AgentWorkflow | null = null;

    private interactionGraph: any;

    private  constructor(interactionGraph: any) {
        this.interactionGraph = interactionGraph;
    }

    static async getInstance(settings: LLM_Settings): Promise<AgentWorkflow> {
        if (this._instance) {
            return this._instance;
        }
        const graph = await initiateLangraphSettings(settings);

        this._instance = new AgentWorkflow(graph);

        return this._instance;
    }

    async destroy() {
        if (this.interactionGraph) {
            try {
                const graph = await this.interactionGraph;
                if (graph && typeof graph.shutdown === "function") {
                    await graph.shutdown();
                }
            } catch (err) {
                console.warn("Erro ao destruir o grafo:", err);
            } finally {
                this.interactionGraph = null;
            }
        }

    }

    getGraph() {
        return  this.interactionGraph;
    }

}

export default AgentWorkflow;