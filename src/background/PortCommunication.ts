import {  PortCommunicationMessage, PortsOfCommunication } from '../messaging/message-types';
import { ACTION_GRAPH } from './action-type';


class PortCommunication {
  private portSidepanel?: chrome.runtime.Port;
  private portContent?: chrome.runtime.Port;


  public getPortSidepanel(): chrome.runtime.Port | undefined{
    return this.portSidepanel;
  }
  public getPortContent(): chrome.runtime.Port | undefined {
    return this.portContent;
  }

  public getPorts(): PortsOfCommunication {
    return {
      SIDEBAR: this.portSidepanel,
      CONTENT: this.portContent
    };
  }

  public setPortSidepanel(port: chrome.runtime.Port): this {
    this.portSidepanel = port;
    return this;
  }
  public setPortContent(port: chrome.runtime.Port): this {
    this.portContent = port;
    return this;
  }
  
  public sendMessageToSidepanel(message: PortCommunicationMessage): void {

    if (this.portSidepanel) {
      this.portSidepanel.postMessage(message);
    } 

  }

  public sendMessageToContent(message: PortCommunicationMessage): void {

    if (this.portContent) {
      this.portContent.postMessage(message);
    } 
   
  }

  public isCommunicationReady(): boolean {
    return this.portSidepanel !== null && this.portContent !== null;
  }

  public endInteraction(): void {
    this.sendMessageToSidepanel({ action: ACTION_GRAPH.END_INTERACTION });
    this.sendMessageToContent({ action: ACTION_GRAPH.END_INTERACTION });
    this.closePorts();
  }

  public closePorts(): void {
    if (this.portSidepanel) {
      this.portSidepanel.disconnect();
      this.portSidepanel = undefined;
    }
    if (this.portContent) {
      this.portContent.disconnect();
      this.portContent = undefined;
    }
  }
}
export default PortCommunication;
