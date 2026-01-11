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
import { ACTION_PORT } from '../../background/action-type';
import { AgentOrchestratorFactory } from './AgentOrchestratorFactory';
import { CancellationError } from '../../errors/background/errors.class.background';

interface StreamEvent {
  node: string;
  event: string;
  result: IQWGraphOutput;
}

class InteractionManager {
  private readonly portCommunication: PortCommunication;
  private readonly state: InteractionState;
  private graphExecution: any = null;
  private settings: LLM_Settings | null = null;
  private skipResolver?: () => void;

  constructor(ports: PortCommunication, state: InteractionState) {
    this.portCommunication = ports;
    this.state = state;
  }

  public isAgentLoaded(): boolean {
    return this.graphExecution !== undefined && this.graphExecution !== null;
  }

  public async buildLanggraph(
    configSettings: LLM_Settings,
    isSpeechTestsEnabled: boolean,
  ): Promise<void> {
    this.settings = configSettings;
    this.graphExecution = AgentOrchestratorFactory.create(
      this.settings,
      isSpeechTestsEnabled,
    ).getGraph();
  }

  async streamEvents(input: TGraphInput, config: RunnableConfig): Promise<IQWGraphOutput> {
    if (this.state.waitingOnStream) {
      console.warn('[Graph] Stream already in progress. Aborting previous...');
      this.state.controller?.abort();
      this.state.waitingOnStream = false;
    }

    try {
      this.validateAgentLoaded();

      const signal = this.state.createNewController();
      this.state.waitingOnStream = true;

      let stream = await this.initializeStream(input, config, signal);

      let eventStream = await this.processStreamLoop(stream, config, signal);

      if (!eventStream) {
        throw new Error('No event stream available.');
      }
      return eventStream.result;
    } catch (error: any) {
      return this.handleStreamError(error);
    } finally {
      this.state.stop();
      this.state.fullReset();
    }
  }

  private validateAgentLoaded(): void {
    if (!this.isAgentLoaded()) {
      throw new Error('Agent is not loaded. Call buildLanggraph() first.');
    }
  }

  private async initializeStream(
    input: TGraphInput,
    config: RunnableConfig,
    signal: AbortSignal,
  ): Promise<any> {
    const stringifyedInput = JSON.stringify(input);

    return this.graphExecution.streamEvents(
      { messages: [new HumanMessage(stringifyedInput)] },
      config,
      { signal },
    );
  }

  private async processStreamLoop(
    stream: any,
    config: RunnableConfig,
    signal: AbortSignal,
  ): Promise<StreamEvent | null> {
    let eventStream: StreamEvent | null = null;

    while (this.state.running && !signal.aborted) {
      eventStream = await this.trackGraphExecution(stream);

      throwIfSignalAborted(signal);

      if (eventStream.event === 'interrupt') {
        stream = await this.handleInterrupt(config, eventStream, signal);
        if (!stream) break;
      } else {
        break;
      }
    }
    throwIfSignalAborted(signal);

    return eventStream;
  }

  private async handleInterrupt(
    config: RunnableConfig,
    eventStream: StreamEvent,
    signal: AbortSignal,
  ): Promise<any | null> {
    if (!this.graphExecution) return null;
    console.log('Updating graph state after interrupt...', eventStream);
    await this.updateGraphState(config, eventStream);

    if (signal.aborted || !this.graphExecution) return null;

    console.log('Resuming graph execution after interrupt...');
    const resumedStream = await this.graphExecution.streamEvents(null, config, { signal });
    console.log('Graph Execution Resumed.');

    return resumedStream;
  }

  private async updateGraphState(config: RunnableConfig, eventStream: StreamEvent): Promise<void> {
    const targetNode = eventStream.node;

    if (this.state.skipInterrupt) {
      console.log(`[InteractionManager] Skipping interrupt via node: ${targetNode}`);

      await this.graphExecution.updateState(config, { isSkipObjectivePressed: true }, targetNode);

      this.state.skipInterrupt = false;
      if (this.skipResolver) {
        this.skipResolver();
        this.skipResolver = undefined;
      }
    } else {
      console.log(`[InteractionManager] Resuming normal flow for node: ${targetNode}`);
      await this.graphExecution.updateState(config, {}, targetNode);
    }
  }

  private handleStreamError(error: any): IQWGraphOutput {
    if (error.name === 'AbortError' || this.state.controller?.signal.aborted) {
      console.log('Interação cancelada pelo utilizador.');
      return { status: STATUS_GRAPH.CANCELLED, actions: [] };
    }
    throw mapLangGraphError(error);
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
            actions: [],
          };
          const streamEvent: StreamEvent = {
            node: action.payload.node,
            event: 'interrupt',
            result: graphOutput,
          };
          this.syncUI();
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
        status: this.state.currentStatus,
      },
    });
  }

  public skipObjectiveInterrupts(): Promise<void> {
    this.state.skipInterrupt = true;
    return new Promise<void>((resolve) => {
      this.skipResolver = resolve;
    });
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
function throwIfSignalAborted(signal: AbortSignal) {
  if (signal.aborted) throw new CancellationError();
}
