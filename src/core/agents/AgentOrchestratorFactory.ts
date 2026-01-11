import { LLM } from '@langchain/core/language_models/llms';
import AgentOrchestrator from './AgentOrchestrator';
import { LLM_Settings } from '../../utils/types';

export class AgentOrchestratorFactory {
  private static managerInstance: AgentOrchestrator | null = null;
  /** initialize the InteractionManager singleton
   *
   * @param ports
   * @returns
   */
  public static create(settings: LLM_Settings, isSpeechTestsEnabled: boolean): AgentOrchestrator {
    // Aqui fazemos o "Enforce" do Singleton se necessário
    if (!this.managerInstance) {
      const agentOrchestrator = new AgentOrchestrator();
      agentOrchestrator.init(settings, isSpeechTestsEnabled);

      this.managerInstance = agentOrchestrator;
    }

    return this.managerInstance;
  }
  /** get the InteractionManager singleton
   *
   * @returns
   */
  public static getInstance(): AgentOrchestrator | null {
    return this.managerInstance;
  }

  /** destroy the InteractionManager singleton
   *  and cleans up resources
   *
   */
  public static async destroy(): Promise<void> {
    if (this.managerInstance) {
      if (this.managerInstance.getGraph()) {
        await this.managerInstance.destroy();
        this.managerInstance = null;
      }
    }
  }
}
