import { ACTION } from './action-type';

class PortCommunication {
  private static _instance: PortCommunication;
  private portSidepanel: chrome.runtime.Port | null = null;
  private portContent: chrome.runtime.Port | null = null;
  private mutex: boolean = false;

  private constructor() {}

  public static getInstance(): PortCommunication {
    if (!PortCommunication._instance) {
      PortCommunication._instance = new PortCommunication();
    }
    return PortCommunication._instance;
  }
  public isMutexLocked(): boolean {
    return this.mutex;
  }
  public lockMutex(): void {
    this.mutex = true;
  }
  public unlockMutex(): void {
    this.mutex = false;
  }
  public buildPortSidepanel(port: chrome.runtime.Port): this {
    this.portSidepanel = port;
    return this;
  }
  public buildPortContent(port: chrome.runtime.Port): this {
    this.portContent = port;
    return this;
  }

  public sendMessageToSidepanel(message: any): void {
    if (this.portSidepanel) {
      this.portSidepanel.postMessage(message);
    } else {
      // TODO: Handle uninitialized port appropriately
      console.log('Port to sidepanel is not initialized.');
    }
  }

  public sendMessageToContent(message: any): void {
    if (this.portContent) {
      this.portContent.postMessage(message);
    } else {
      // TODO: Handle uninitialized port appropriately
      console.log('Port to content is not initialized.');
    }
  }

  public isCommunicationReady(): boolean {
    return this.portSidepanel !== null && this.portContent !== null;
  }

  public endInteraction(): void {
    this.sendMessageToSidepanel({ action: ACTION.END_INTERACTION });
    this.sendMessageToContent({ action: ACTION.END_INTERACTION });
    this.closePorts();
  }

  public closePorts(): void {
    if (this.portSidepanel) {
      this.portSidepanel.disconnect();
      this.portSidepanel = null;
    }
    if (this.portContent) {
      this.portContent.disconnect();
      this.portContent = null;
    }
    this.mutex = false;
  }
}
export default PortCommunication;
