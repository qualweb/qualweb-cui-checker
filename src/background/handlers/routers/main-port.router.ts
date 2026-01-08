import {  PORT_NAME } from '../../action-type';
import PortCommunication from '../../PortCommunication';
import { PortsOfCommunication } from '../../../messaging/message-types';
import { broadcastMessageOnPorts } from '../../../messaging/message-helpers';
import {processErrorEventPortsBackground} from '../../../errors/background/error.handler.background';
import { handleContentPort } from './content-port.router';
import { handleSidePanelPort } from './sidepanel-port.router';
import { InteractionManagerFactory } from '../../factories/InteractionManagerFactory';
import { PortCommunicationFactory } from '../../factories/PortCommunicationFactory';


  console.log('Background port-handler initialized.');

  if (!chrome.runtime.onConnect.hasListener(handlerOnPortConnectInteraction)) {
    chrome.runtime.onConnect.addListener(handlerOnPortConnectInteraction);
  }

  function handlerOnPortConnectInteraction(port: chrome.runtime.Port) {

    switch (port.name) {
      case PORT_NAME.CONTENT_SCRIPT:
         handleContentPort(port);
        break;
      case PORT_NAME.SIDEBAR:
         handleSidePanelPort(port);
        break;
      default:
        processErrorEventPortsBackground(new Error('UnknownPortError'), { CONTENT: port });
        break;
      }

  }

  

export function notifyPortsInteractionEnded(coms:PortCommunication): void {


  const ports:PortsOfCommunication = coms.getPorts();

  broadcastMessageOnPorts(ports,  { action: 'interaction_ended' });

} 

export function endInteractionAndCleanup() {
  // send message to both ports to stop interaction
  InteractionManagerFactory.destroy();
  PortCommunicationFactory.destroy();
}

