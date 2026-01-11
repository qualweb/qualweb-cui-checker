import PortCommunication from '../PortCommunication';

export class PortCommunicationFactory {
  private static managerInstance: PortCommunication | null = null;

  public static init(): PortCommunication {
    this.managerInstance ??= new PortCommunication();

    return this.managerInstance;
  }
  public static getInstance(): PortCommunication | null {
    return this.managerInstance;
  }
  public static destroy(): void {
    if (this.managerInstance) {
      this.managerInstance.closePorts();

      this.managerInstance = null;
    }
  }
}
