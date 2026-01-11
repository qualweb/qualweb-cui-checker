import { UnknownError } from '../../../errors/background/errors.class.background';
import { PortsOfCommunication } from '../../../messaging/message-types';
import { ACTION_PORT } from '../../action-type';
import InteractionManager from '../../../core/agents/InteractionManager';
import PortCommunication from '../../PortCommunication';
import { endInteractionAndCleanup } from '../routers/main-port.router';
import { dispatchCallbackErrorHandler } from '../util';

interface IPortHandlersArgs {
  instancePortCommunication: PortCommunication;
  instanceInteractionManager: InteractionManager;
  msg: any;
}
type fnHandlerPortSidepanel = (args: IPortHandlersArgs) => void;

export const INTERACTION_PORT_SIDEPANEL_HANDLERS: Record<string, fnHandlerPortSidepanel> = {
  [ACTION_PORT.START_INTERACTION]: (args: IPortHandlersArgs) => {
    args.instanceInteractionManager
      .buildLanggraph(args.msg.data.settings, args.msg.data.isSpeechTestsEnabled)
      .then(() => {
        args.instancePortCommunication.sendMessageToSidepanel({
          action: ACTION_PORT.START_INTERACTION,
        });
      })
      .catch((error) => {
        const ports: PortsOfCommunication = {
          CONTENT: args.instancePortCommunication.getPortContent(),
          SIDEBAR: args.instancePortCommunication.getPortSidepanel(),
        };
        const normalizedError = error instanceof Error ? error : new UnknownError(String(error));
        dispatchCallbackErrorHandler(normalizedError, ports);
      });
  },
  [ACTION_PORT.CANCEL_INTERACTION]: (_: IPortHandlersArgs) => {
    endInteractionAndCleanup();
  },
  [ACTION_PORT.SKIP_OBJECTIVE_INTERACTION]: ({ instanceInteractionManager }: IPortHandlersArgs) => {
    instanceInteractionManager.skipObjectiveInterrupts();
  },
};
