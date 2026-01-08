import { v4 as uuidv4 } from 'uuid';
import { extractAssistantMessage,  } from '../lib/utils';
import {  ACTION_PORT } from '../../background/action-type';
import { IGraphInitialInput, TGraphInput } from '../../core/agents/domain/GraphInput';
import GraphInitialInput from '../../core/agents/domain/GraphInput/GraphInitialInput';
import { IQWGraphOutput } from '../../core/agents/domain/GraphOutput';
import ActionHandlerRegistry from './actions/ActionHandlerRegistry';
import { STATUS_GRAPH } from '../../core/agents/domain';
import { processErrorEventPortContent } from '../../errors/content/error.handler.content';
import ChatbotActions from '../detection/ChatbotActions';
import * as ErrorClass from "../../errors/content/errors.class.content";
import { resetAssistantInteractionMessages } from './actions/ActionHandlers';
export interface ConfigThread {
  configurable: {
    thread_id: string;
  };
  version: any;
}

interface CommunicationContract {
    action: string;
    config?: ConfigThread;
    data?: TGraphInput; 
  }



class InteractionWorkflow {
  private initialMsg?: HTMLElement[];
  private configContract?: ConfigThread;
  private isRunning: boolean = true;
  private turnCount: number = 0;
  private isVoiceInteraction: boolean = false;
  private backgroundPort?: chrome.runtime.Port ;
  private abortController?: AbortController;
  private signal?: AbortSignal;
  private readonly chatbotActions: ChatbotActions;

  public constructor(chatbotActions: ChatbotActions
   ){
    this.chatbotActions = chatbotActions;
   }
  

  public config( initialMsg: HTMLElement[], isVoiceInteraction: boolean, backgroundPort: chrome.runtime.Port ) {
    this.configContract = {
      configurable: {
        thread_id: uuidv4(),
      },
      version: 'v2' as const,
    };
    this.initialMsg = initialMsg;
    this.isVoiceInteraction = isVoiceInteraction;
    this.backgroundPort = backgroundPort;
  }
public  init() {
    this.isRunning = true;
    this.setListenersPort();
    if(!this.initialMsg || !this.backgroundPort || !this.configContract){
      throw new ErrorClass.PortInitialConfigurationError('InteractionWorkflow not properly configured before init.');
    }
    const initialText = extractAssistantMessage(this.initialMsg);
    
    sendMessageToBackgroundPort(this.backgroundPort, {
      action: ACTION_PORT.PROCESS_MESSAGE,
      data: new GraphInitialInput(document.URL, initialText).toJSON() as IGraphInitialInput,
      config: this.configContract,
    });
  }
  private setListenersPort() {
    this.abortController = new AbortController();
            this.signal = this.abortController.signal;
    const messageHandler = async (msg: any) => {
      if (!this.isRunning) return;

      try {
        switch (msg.action) {
          case ACTION_PORT.START_INTERACTION:
            this.abortController = new AbortController();
            this.signal = this.abortController.signal;
            break;
          case ACTION_PORT.CANCEL_INTERACTION:
            this.abortController?.abort();
            break;
          case ACTION_PORT.END_INTERACTION:
            this.terminate('Interaction ended by background');
            break;
          case ACTION_PORT.PROCESS_MESSAGE:
            await this.processNextStep(msg.data as IQWGraphOutput, this.signal!);
            break;
        }
      } catch (error) {
        this.handleCriticalError(error as Error);
      }
    };

    this.backgroundPort?.onMessage.addListener(messageHandler);
    this.backgroundPort?.onDisconnect.addListener(() => {
      this.abortController?.abort();
      this.terminate('Port disconnected');
    });
  }

 private async processNextStep(graphOutput: IQWGraphOutput, signal: AbortSignal) {
    // executte action handlers
    console.log('Processing graph output:', JSON.stringify(graphOutput));

    this.turnCount++;
    
    await ActionHandlerRegistry.executeActions(graphOutput?.actions, {
      interfaceActions: this.chatbotActions,
      backgroundPort: this.backgroundPort!,
      interactionCount: this.turnCount,
      isVoiceInteraction: this.isVoiceInteraction,
      threadConfig: this.configContract!,
      signal:signal
    });

    if (graphOutput.status === STATUS_GRAPH.COMPLETED) {
      return this.terminate('Interaction completed successfully');
    }
    
  }
  private _abortInteraction() {
        sendMessageToBackgroundPort(this.backgroundPort!, {
          action: ACTION_PORT.CANCEL_INTERACTION,
          data: undefined,
          config: this.configContract,
        });
    this.abortController?.abort();
  }
  private terminate(reason: string) {
    this.isRunning = false;
    ActionHandlerRegistry.cancelPendingExecutions();

  }

  public async skipCurrentObjective() {
    try {
    await ActionHandlerRegistry.cancelPendingExecutions();
    console.log('Skipping current objective in interaction workflow');
    sendMessageToBackgroundPort(this.backgroundPort!, {
      action: ACTION_PORT.SKIP_OBJECTIVE_INTERACTION,
      data: undefined,
      config: this.configContract,
    });
    } catch (error) {
      console.error('Error while skipping current objective:', error);
    }
  }
  
  private handleCriticalError(error: Error) {
    processErrorEventPortContent(error, this.backgroundPort!);
    this.terminate(`Error: ${error.message}`);
    resetAssistantInteractionMessages();
    this.isRunning = false;
    this.abortController?.abort();
  }

  public async destroy() {
    this.isRunning = false;
    
    await ActionHandlerRegistry.cancelPendingExecutions();
    resetAssistantInteractionMessages();
    console.log('Destroying InteractionWorkflow and aborting ongoing processes.');
    if(this.backgroundPort){
    sendMessageToBackgroundPort(this.backgroundPort, {
      action: ACTION_PORT.CANCEL_INTERACTION,
      data: undefined,
      config: this.configContract,
    });
    }
  
    this.abortController?.abort();
  }

}

export  function sendMessageToBackgroundPort(port: chrome.runtime.Port, payload: CommunicationContract) {
    try {

    port.postMessage(payload);
    }catch  {
     throw new ErrorClass.FailedCommunicationWithBackgroundError('Failed to send message to background interaction bidirectional port.');
    }
  }
export default InteractionWorkflow;
