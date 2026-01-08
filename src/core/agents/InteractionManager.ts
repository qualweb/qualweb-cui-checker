import { HumanMessage } from '@langchain/core/messages';
import { IQWGraphOutput } from './domain/GraphOutput/types';
import { RunnableConfig } from '@langchain/core/runnables';
import PortCommunication from '../../background/PortCommunication';
import { mapLangGraphError } from '../../errors/mapper/langgraph-error.mapper';
import { GraphEventProcessor } from './GraphEventProcessor';
import { InteractionState } from './InteractionState';
import { STATUS_GRAPH } from './domain';
import { TGraphInput } from './domain/GraphInput';
import { LLM_Settings } from '../../utils/types';
import { InteractionLock } from './InteractionLock';
import {  ACTION_PORT } from '../../background/action-type';
import { AgentOrchestratorFactory } from './AgentOrchestratorFactory';


interface StreamEvent {
  node: string;
  event: string;
  result: IQWGraphOutput 
}

class InteractionManager {
  private readonly portCommunication: PortCommunication;
  private readonly state: InteractionState;
  private graphExecution: any = null; 
  private settings: LLM_Settings | null = null;

   constructor(ports: PortCommunication, state: InteractionState) {
    this.portCommunication = ports;
    this.state = state;
  }

  public isAgentLoaded(): boolean {
    return this.graphExecution !== undefined && this.graphExecution !== null;
  }

  public async buildLanggraph(configSettings: LLM_Settings,isSpeechTestsEnabled:boolean): Promise<void> {
    this.settings = configSettings;
    this.graphExecution = AgentOrchestratorFactory.create(this.settings,isSpeechTestsEnabled).getGraph();
  }


async streamEvents(input: TGraphInput, config: RunnableConfig): Promise<IQWGraphOutput> {
  try {
    if (!this.isAgentLoaded()) {
      throw new Error('Agent is not loaded. Call buildLanggraph() first.');
    }

    const signal = this.state.createNewController();

    const stringifyedInput = JSON.stringify(input);
    this.state.waitingOnStream = true;
    let stream = await this.graphExecution.streamEvents(
      { messages: [new HumanMessage(stringifyedInput)] },
      config,
      { signal }
    );

    let eventStream: StreamEvent;
    
    while (this.state.running) {
      eventStream = await this.trackGraphExecution(stream);

      if (eventStream.event === 'interrupt') {
        if(this.state.skipInterrupt) {
           await this.graphExecution.updateState(config, { isSkipObjectivePressed: true });
            this.state.skipInterrupt = false;
        }else{
          await this.graphExecution.updateState(config, {}, eventStream.node);
         }
            console.log('Resuming graph execution after interrupt...');
            stream = await this.graphExecution.streamEvents(null, config, { signal });
            console.log('Graph Execution Resumed.');
      } else {
        break;
      }
    }
    
    return eventStream!.result;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Interação cancelada pelo utilizador.');
      return { status: 'cancelled' } as any;
    }
    throw mapLangGraphError(error);
  } finally {
    this.state.stop();
  }
}

public isWaitingOnStream(): boolean {
    return this.state.waitingOnStream;
  }

  
/** Tracks the execution of the LangGraph stream.
 * 
 * @param stream 
 * @returns 
 */
  async trackGraphExecution(stream: AsyncIterable<any>): Promise<StreamEvent> {
  let graphOutput: IQWGraphOutput = {
    status: STATUS_GRAPH.FAILED,
  } as IQWGraphOutput;
  InteractionLock.refresh();

  for await (const step of stream) {
    const action = GraphEventProcessor.parse(step);

    if (!action) continue;

    switch (action.type) {
      case 'INTERRUPT': {
        graphOutput = {
          status: STATUS_GRAPH.INTERRUPTED,
          actions: []

        } ;
        const streamEvent: StreamEvent = { node: action.payload.node, event: 'interrupt', result: graphOutput };
        return streamEvent;
      }

      case 'OBJECTIVE_UPDATE':
        this.state.currentRule = action.payload.rule || '';
        this.state.currentTitle = action.payload.title || '';
        this.syncUI();
        break;

      case 'STATUS_UPDATE':
        this.state.currentStatus = action.payload.status || '';
        this.syncUI();
        break;

      case 'FINAL_RESULT':
        graphOutput = action.payload.result as IQWGraphOutput;
        this.state.currentStatus = 'Waiting for Response...';
        this.syncUI();
        break;
    }
  }


  return { node: '', event: 'complete', result: graphOutput };
}
private syncUI() {
  this.portCommunication.sendMessageToSidepanel({
    action: ACTION_PORT.UPDATE_INTERACTION_STATE,
    data: {
    rule: this.state.currentRule,
    title: this.state.currentTitle,
    status: this.state.currentStatus
    }
  });
}

  public skipObjectiveInterrupts() {
    this.state.skipInterrupt = true;
  }

  public async cancelInteraction() {
    if (this.isAgentLoaded()) {
      this.state.controller?.abort();
      this.portCommunication.endInteraction();
      await AgentOrchestratorFactory.destroy();
    }
  }


  public prepareForDestruction() {
    AgentOrchestratorFactory.destroy().finally(async () => {
      console.log('Agent Orchestrator destroyed successfully.');
      this.state.fullReset();
      this.settings = null;
      this.graphExecution = null;
      await this.unlockMutex();
    });
  }
  
  public async isMutexLocked(): Promise<boolean> {
    return await InteractionLock.isLocked();
  }
  public async lockMutex(): Promise<void> {
    await InteractionLock.acquire();
  }
  public async unlockMutex(): Promise<void> {
    await InteractionLock.release();
  }
  
}

export default InteractionManager;
