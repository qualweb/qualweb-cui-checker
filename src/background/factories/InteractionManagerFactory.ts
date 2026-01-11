import InteractionManager from '../../core/agents/InteractionManager';
import { InteractionState } from '../../core/agents/InteractionState';
import PortCommunication from '../PortCommunication';

export class InteractionManagerFactory {
  private static managerInstance: InteractionManager | null = null;
  /** initialize the InteractionManager singleton
   *
   * @param ports
   * @returns
   */
  public static init(ports: PortCommunication): InteractionManager {
    // Aqui fazemos o "Enforce" do Singleton se necessário
    if (!this.managerInstance) {
      const state = new InteractionState();

      this.managerInstance = new InteractionManager(ports, state);
    }

    return this.managerInstance;
  }
  /** get the InteractionManager singleton
   *
   * @returns
   */
  public static getInstance(): InteractionManager | null {
    return this.managerInstance;
  }

  /** destroy the InteractionManager singleton
   *  and cleans up resources
   *
   */
  public static destroy(): void {
    if (this.managerInstance) {
      this.managerInstance.prepareForDestruction();

      this.managerInstance = null;
    }
  }
}
