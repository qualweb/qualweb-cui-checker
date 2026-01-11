import {  UnknownError } from "../../../errors/background/errors.class.background";
import { PortsOfCommunication } from "../../../messaging/message-types";
import InteractionManager from "../../../core/agents/InteractionManager";
import PortCommunication from "../../PortCommunication";
import { endInteractionAndCleanup, notifyPortsInteractionEnded } from "./main-port.router";
import { INTERACTION_PORT_CONTENT_HANDLERS } from "../registries/registry-content.handlers";
import { dispatchCallbackErrorHandler } from "../util";
import { InteractionManagerFactory } from "../../factories/InteractionManagerFactory";
import { PortCommunicationFactory } from "../../factories/PortCommunicationFactory";
import { InstanceNotInitializedError, PortConnectionError } from "../../../errors/content/errors.class.content";

const controller: AbortController = new AbortController();

export function handleContentPort(port: chrome.runtime.Port) {
    const comms = PortCommunicationFactory.getInstance();
    if (!comms) {
    throw new PortConnectionError('PortCommunication instance is not initialized.');
    }
    const instanceInteractionManager = InteractionManagerFactory.getInstance();
    if (!instanceInteractionManager) {
    throw new InstanceNotInitializedError('InteractionManager instance is not initialized.');
    }

    comms?.setPortContent(port);

    console.log('Content script port connected');

    port.onMessage.addListener(portContentMessageHandlerBuilder(comms, instanceInteractionManager));
    port.onDisconnect.addListener(() => {
      // Handle disconnection if needed

      notifyPortsInteractionEnded(comms);
      endInteractionAndCleanup();
    
    });
  }
    const portContentMessageHandlerBuilder = (instancePortCommunication:PortCommunication,instanceInteractionManager:InteractionManager) => (msg: any) => {
      // Handle messages from content script
      console.log("Content Port Message Received:", JSON.stringify(msg));
      try {
        const handler = INTERACTION_PORT_CONTENT_HANDLERS[msg.action];
        if (handler) {
          
          handler({ instanceInteractionManager: instanceInteractionManager, 
                    instancePortCommunication: instancePortCommunication, msg });

        } else if (msg.status === "error") {
                
            throw new UnknownError(msg.message);
        
        } else {
        console.log('No handler found for action:', msg.action);
        return;
        }


   
      } catch (error) {

         const normalizedError = error instanceof Error ? error : new UnknownError(String(error));

        const communicationsPorts: PortsOfCommunication = instancePortCommunication.getPorts();
        dispatchCallbackErrorHandler(normalizedError, communicationsPorts);
        
      }
  
    };

