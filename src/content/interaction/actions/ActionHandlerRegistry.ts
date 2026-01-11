import {  GraphOutputAction } from "../../../core/agents/domain/GraphOutput";
import { interruptSignalHandlerWithError } from "../../../core/interrupter/signalUtil";
import { CancellationError } from "../../../errors/background/errors.class.background";
import ChatbotActions from "../../detection/ChatbotActions";
import { ConfigThread } from "../InteractionWorkflow";

export interface ActionHandlerArgs {
    interfaceActions: ChatbotActions;
    backgroundPort: chrome.runtime.Port;
    interactionCount: number;
    threadConfig: ConfigThread;
    isVoiceInteraction?: boolean;
    signal: AbortSignal;
}

type handlerFn = (data: GraphOutputAction, args: ActionHandlerArgs) => Promise<void>;

class ActionHandlerRegistry {
  private static  readonly handlers = new Map<string, handlerFn>();
  private static readonly pendingExecutions = new Map<Promise<void>, AbortController>();
  private static cancelRequested = false;

  /**
   * Register a handler for a given test type
   */
  static register(type: string, handler: handlerFn): void {
    this.handlers.set(type, handler);
  }
  
  /**
   * Execute the handlers for a list of actions
   */
  static async executeActions (actionList: GraphOutputAction[], args: ActionHandlerArgs): Promise<void> {
    try{
     interruptSignalHandlerWithError(args.signal);
    // Sort
    //QuestionAction and Recognition should be last to avoid problems with logic with lastMessages
  const targets = new Set(['QuestionAction', 'PlaySound']);

  const sortedActions = [...actionList].sort((a, b) => {
    const aVal = targets.has(a._type) ? 1 : 0;
    const bVal = targets.has(b._type) ? 1 : 0;

    return aVal - bVal;
  });

    for (const data of sortedActions) {
      const executionController = new AbortController();
       //const combinedSignal = this.combineSignals(args.signal, executionController.signal);
        const executionArgs = { ...args, signal:  executionController.signal };
        
        const executionPromise = this.execute(data, executionArgs);
        this.pendingExecutions.set(executionPromise, executionController);
       try {
          await executionPromise;
       } catch (error: any) {

        const isInternalAbort = executionController.signal.aborted;
        const isExternalAbort = args.signal.aborted || this.cancelRequested;
        const isCancellationError = error instanceof CancellationError || 
                                    error?.name === 'AbortError' || 
                                    error?.name === 'CancellationError';

        if (isInternalAbort || isExternalAbort || isCancellationError) {

          if (isExternalAbort) return; 
          continue; 
        }
        
        throw error;

        } finally {
          this.pendingExecutions.delete(executionPromise);
        }
        }
      
    } finally {
      this.cancelRequested = false;
      this.pendingExecutions.clear();
    }
  
    }
  
static async isPromisesExecuting():Promise<boolean>{
    return this.pendingExecutions.size > 0;
  }

 /**
   * Execute the handler for a given test type
   */
  static async execute(data: GraphOutputAction, args: ActionHandlerArgs): Promise<void> {
    if (this.cancelRequested) {
      throw new CancellationError();
    }
    interruptSignalHandlerWithError(args.signal);
    const handler = this.handlers.get(data._type);
    
    if (!handler) {
      throw new Error(
        `No handler registered for type: ${data._type}. ` +
        `Available types: ${Array.from(this.handlers.keys()).join(', ')}`
      );
    }
    
    
    const instance = await handler(data, args);
    
    
    return instance;
  }

 /**
   * Cancel all pending executions without affecting the original AbortSignal
   */
  static async cancelPendingExecutions(): Promise<void> {
    // Set flag to prevent new executions
    this.cancelRequested = true;
    
    // Abort all individual execution controllers
    const controllers = Array.from(this.pendingExecutions.values());
    for (const controller of controllers) {
      controller.abort();
    }
    
    // Wait for all pending promises to settle
    if (this.pendingExecutions.size > 0) {
      const promises = Array.from(this.pendingExecutions.keys());
      await Promise.allSettled(promises);
    }
    
    // Clear the map
    this.pendingExecutions.clear();
    this.cancelRequested = false;
  }
  /**
   * Combine multiple AbortSignals into one
   */
  
  private static combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    
    return controller.signal;
  }

  /**
   * Get all registered types
   */
  static getRegisteredTypes():string [] {
    return Array.from(this.handlers.keys());
  }

}

export default ActionHandlerRegistry;
