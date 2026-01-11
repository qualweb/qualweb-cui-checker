import {
  InteractionInProgressError,
  UnknownError,
} from '../../../errors/background/errors.class.background';
import { PortsOfCommunication } from '../../../messaging/message-types';
import { ACTION_PORT } from '../../action-type';
import { InteractionLock } from '../../../core/agents/InteractionLock';
import InteractionManager from '../../../core/agents/InteractionManager';
import PortCommunication from '../../PortCommunication';
import { endInteractionAndCleanup, notifyPortsInteractionEnded } from './main-port.router';
import { INTERACTION_PORT_SIDEPANEL_HANDLERS } from '../registries/registry-sidepanel.handlers';
import { dispatchCallbackErrorHandler } from '../util';
import { InteractionManagerFactory } from '../../factories/InteractionManagerFactory';
import { PortCommunicationFactory } from '../../factories/PortCommunicationFactory';

// Handler for Sidepanel PORT .

export function handleSidePanelPort(port: chrome.runtime.Port): void {
  let comms: PortCommunication;
  InteractionLock.acquire()
    .then((acquired) => {
      if (!acquired) throw new InteractionInProgressError();
    })
    .then(() => {
      comms = PortCommunicationFactory.init();
      comms.setPortSidepanel(port);
      const interaction = InteractionManagerFactory.init(comms);

      const onMessage = (msg: any) => {
        try {
          const handler = INTERACTION_PORT_SIDEPANEL_HANDLERS[msg.action];
          if (handler) {
            handler({
              instanceInteractionManager: interaction,
              instancePortCommunication: comms,
              msg,
            });
          } else {
            console.log('No handler found for action:', msg.action);
            return;
          }
        } catch (error) {
          const ports: PortsOfCommunication = comms.getPorts();

          const normalizedError = error instanceof Error ? error : new UnknownError(String(error));
          dispatchCallbackErrorHandler(normalizedError, ports);
        }
      };

      port.onMessage.addListener(onMessage);

      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(onMessage);

        notifyPortsInteractionEnded(comms);
        endInteractionAndCleanup();
      });

      // send ready signal to sidepanel
      comms.sendMessageToSidepanel({ action: ACTION_PORT.READY });
    })
    .catch((error) => {
      const ports: PortsOfCommunication = comms.getPorts();

      const normalizedError = error instanceof Error ? error : new UnknownError(String(error));

      return dispatchCallbackErrorHandler(normalizedError, ports);
    });
}
