import { IGraphSkipObjectiveInput } from '../../../core/agents/domain/GraphInput';
import { UnknownError } from '../../../errors/background/errors.class.background';
import { PortsOfCommunication } from '../../../messaging/message-types';
import { ACTION_PORT } from '../../action-type';
import { InteractionLock } from '../../../core/agents/InteractionLock';
import InteractionManager from '../../../core/agents/InteractionManager';
import PortCommunication from '../../PortCommunication';
import { endInteractionAndCleanup } from '../routers/main-port.router';
import { dispatchCallbackErrorHandler } from '../util';

interface IPortHandlersArgs {
  instancePortCommunication: PortCommunication;
  instanceInteractionManager: InteractionManager;
  msg: any;
}
type fnHandlerPortContent = (args: IPortHandlersArgs) => void;

/**
 * Registry of handlers for content port interactions.
 */
export const INTERACTION_PORT_CONTENT_HANDLERS: Record<string, fnHandlerPortContent> = {
  [ACTION_PORT.PROCESS_MESSAGE]: ({
    instancePortCommunication,
    instanceInteractionManager,
    msg,
  }: IPortHandlersArgs) => {
    sendMessageToLanggraphAndRespond(instanceInteractionManager, msg, instancePortCommunication);
  },

  [ACTION_PORT.CANCEL_INTERACTION]: (_: IPortHandlersArgs) => {
    endInteractionAndCleanup();
  },
  [ACTION_PORT.SKIP_OBJECTIVE_INTERACTION]: ({
    instanceInteractionManager,
    instancePortCommunication,
    msg,
  }: IPortHandlersArgs) => {
    if (instanceInteractionManager.isWaitingOnStream()) {
      // 1. Caso esteja em streaming, interrompe o grafo
      instanceInteractionManager
        .skipObjectiveInterrupts()
        .then(() => {
          // Envia confirmação para o Content Script resolver a Promise do UI
          instancePortCommunication.sendMessageToContent({
            action: ACTION_PORT.SKIP_OBJECTIVE_INTERACTION,
            data: { status: 'success' },
          });
        })
        .catch((error: any) => {
          const communicationsPorts: PortsOfCommunication = {
            CONTENT: instancePortCommunication.getPortContent(),
            SIDEBAR: instancePortCommunication.getPortSidepanel(),
          };
          const normalizedError = error instanceof Error ? error : new UnknownError(String(error));
          dispatchCallbackErrorHandler(normalizedError, communicationsPorts);
        });
    } else {
      // 2. Caso não esteja em streaming, envia o comando de Skip para o Langgraph
      const input = { _type: 'GraphSkipObjectiveInput' };

      // Primeiro: Notifica o Content Script para desbloquear o estado de "isSkipping"
      instancePortCommunication.sendMessageToContent({
        action: ACTION_PORT.SKIP_OBJECTIVE_INTERACTION,
        data: { status: 'success' },
      });

      // Segundo: Clona a mensagem original para garantir que o 'config' e outros metadados seguem viagem
      const clonedMsg = { ...msg, data: input };

      sendMessageToLanggraphAndRespond(
        instanceInteractionManager,
        clonedMsg,
        instancePortCommunication,
      );
    }
  },
  [ACTION_PORT.ERROR]: ({
    instanceInteractionManager,
    instancePortCommunication,
    msg,
  }: IPortHandlersArgs) => {
    const message = msg.data;
    instancePortCommunication.sendMessageToSidepanel(message);
    endInteractionAndCleanup();
  },
};

/**  Sends a message to Langgraph and handles the response.
 *
 * @param instanceInteractionManager
 * @param msg
 * @param instancePortCommunication
 */

export function sendMessageToLanggraphAndRespond(
  instanceInteractionManager: InteractionManager,
  msg: any,
  instancePortCommunication: PortCommunication,
) {
  instanceInteractionManager
    .streamEvents(msg.data, msg.config)
    .then((finalOutput) => {
      console.log('Final output from interaction:', finalOutput);

      if (finalOutput?.actions?.length) {
        instancePortCommunication.sendMessageToContent({
          action: ACTION_PORT.PROCESS_MESSAGE,
          data: finalOutput,
        });
        // Refresh the interaction lock for another minute for waiting for answer from content script
        InteractionLock.refresh(60000);
      }
      if (finalOutput.status === 'completed') {
        endInteractionAndCleanup();
      }
    })
    .catch((error) => {
      const communicationsPorts: PortsOfCommunication = {
        CONTENT: instancePortCommunication.getPortContent(),
        SIDEBAR: instancePortCommunication.getPortSidepanel(),
      };
      const normalizedError = error instanceof Error ? error : new UnknownError(String(error));
      dispatchCallbackErrorHandler(normalizedError, communicationsPorts);
    });
}
