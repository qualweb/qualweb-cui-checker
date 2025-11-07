
import { HumanMessage } from '@langchain/core/messages';
import AgentWorkflow from './assistant-interaction/AgentWorkflow';
import { FinalOutput } from './assistant-interaction/objectives';
import { INTERRUPT_NODE_NAMES, NODE_COMPLETE_MAP, NODE_STATUS_MAP } from './States';
import { RunnableConfig } from '@langchain/core/runnables';
import { ACTION } from './action-type';

interface StreamEvent {
  node: string;
  event: string; // interrupt ou complete or other
  result: FinalOutput | string | null;
}



class InteractionManager {
  private static interactionManager: InteractionManager | null = null;
  private graphExecution: any = null;
  private settings: any = null;
  private skipInterrupt: boolean = false;
  private currentNode: string = '';
  private lastEvent: any = null;
  private currentRule: string = '';
  private interactionPort: chrome.runtime.Port | null = null;
  private config: RunnableConfig | null = null;
  private controller: AbortController | null = null;
  private contentPort: chrome.runtime.Port | null = null;
  private running: boolean = false;
  private constructor() {
 
  }

  public static getInstance(): InteractionManager {
    if (!this.interactionManager) {
      this.interactionManager = new InteractionManager();
    }
    return this.interactionManager;
  }

  public isAgentLoaded(): boolean {
    return this.graphExecution !== undefined && this.graphExecution !== null;
  }

  public isPortConnected(): boolean {
    return this.interactionPort !== undefined && this.interactionPort !== null;
  }

  public setUIPort(port: chrome.runtime.Port) {
    this.interactionPort = port;
  }
  public setContentPort(port: chrome.runtime.Port) {
    this.contentPort = port;
  }

  public getUIPort(): chrome.runtime.Port | null {
    return this.interactionPort;
  }

  public getContentPort(): chrome.runtime.Port | null {
    return this.contentPort;
  }

  public async buildLanggraph(configSettings: any) {
    this.settings = configSettings;
    this.graphExecution = (await AgentWorkflow.getInstance(this.settings)).getGraph();
  }

  public cancelInteraction() {
    if (this.isAgentLoaded()) {
      this.controller?.abort();
      this.interactionPort?.postMessage({ action:'cancelled' });
      this.contentPort?.postMessage({ action:ACTION.END_INTERACTION });
      this.controller = null;
      this.running = false;
    
    }
  }

  public skipInteraction() {
    this.skipInterrupt = true;
  }

  async streamEvents(messages,config): Promise<FinalOutput> {
    this.controller = new AbortController();
    this.running = true;
    if (!this.isPortConnected()) {
      throw new Error('Interaction port is not connected.');
    }
    if (!this.isAgentLoaded()) {
      throw new Error('Agent graph is not loaded.');
    }
    this.config = config;
    // create HumanMessage 
    const assistantMessage = { messages: [new HumanMessage(messages)] };

    let stream = await this.graphExecution.streamEvents(assistantMessage, this.config, this.controller.signal);

    let eventStream: StreamEvent;
    while (true) {

      eventStream = await this.trackGraphExecution(stream);
      // if not running, break
      if(!this.running) break;
      if (eventStream.event === 'interrupt') {
        if (this.skipInterrupt) {

          await this.graphExecution.updateState(this.config, { isSkipObjectivePressed: true });

         this.skipInterrupt = false;
        } else {

          await this.graphExecution.updateState(this.config, {}, eventStream.node);

        }
        stream = await this.graphExecution.streamEvents(null, this.config);
      } else {
        console.log('Complete interaction, event given back', eventStream);
        break;
      }

    }

    return eventStream.result as FinalOutput;
  };

  async trackGraphExecution(stream: AsyncIterable<any>): Promise<StreamEvent> {
    let response: unknown;

    for await (const step of stream) {
      console.log(step);

      if (this.isInterrupt(step)) {
        return { node: step.name, event: 'interrupt', result: '' };
      }

      if (step.event === 'on_chain_start') {
        this.handleChainStart(step);
      }

      if (step.event === 'on_chain_end') {
        if(step.name === 'objective_assigner') {  
          this.currentRule = step.data.output.currentObjective.test.code as string;
        }
        response = this.handleChainEnd(step);
      }
    }

    this.interactionPort?.postMessage({ rule:this.currentRule, status: 'Waiting for answer' });
    return { node: '', event: 'complete', result: response as FinalOutput };
  }

  private isInterrupt(step: any): boolean {
    return step.event === 'interrupt' || INTERRUPT_NODE_NAMES.includes(step.name);
  }

  private handleChainStart(step: any): void {
    this.currentNode = step.name;
    const status = NODE_STATUS_MAP[step.name];
    if (status) {
      this.interactionPort?.postMessage({ rule: this.currentRule , status });
    }
  }

  private handleChainEnd(step: any): FinalOutput | string | undefined {
    this.lastEvent = step;
    const status = NODE_COMPLETE_MAP[step.name];
    if (status) {
      this.interactionPort?.postMessage({ rule: this.currentRule, status });
    }

    if (step.name === 'LangGraph' && step.data?.output.finalOutput) {
      return step.data.output.finalOutput as FinalOutput;
    }
    return undefined;
  }

  public setInteractionPortNull() {
    this.interactionPort = null;
  }

  public setContentPortNull() {
    this.contentPort = null;
  }

  public clearInteractionManager() {
    // if any port is connected, disconnect
    if (this.interactionPort) {
      this.interactionPort.disconnect();
    }
    if (this.contentPort) {
      this.contentPort.disconnect();
    }
    this.controller = null;
    this.running = false;
    this.settings = null;
    this.skipInterrupt = false;
    this.graphExecution = null;
    this.contentPort = null;
    this.config = null;
    this.interactionPort = null;
  
  }
}

export default InteractionManager;