import { CancellationError } from '../../../errors/background/errors.class.background';
import TimeoutManager from '../../timeouts/TimeoutManager';
import { DetailedMutationEvent, MUTATION_PROCESSOR_REGISTRY, MutationHandler } from '../../Types';

/**
 * AbstractMutationObserver
 * Responsável por encapsular a complexidade do MutationObserver e a gestão
 * do seu ciclo de vida assíncrono.
 */
abstract class AbstractMutationObserver<P> {
  protected timeoutManager: TimeoutManager<void | P> | null = null;
  protected observer: MutationObserver | null = null;
  
  // Handlers para os eventos de mutação
  private readonly handlers: Map<DetailedMutationEvent, MutationHandler[]> = new Map();

  // Controladores da Promise de espera (Substituem o Monkey Patching)
  private resolveWaitingPromise: (() => void) | null = null;
  private rejectWaitingPromise: ((reason: any) => void) | null = null;
  private abortHandler: (() => void) | null = null;

  // Flags de estado
  protected isDisconnecting: boolean = false;

  /**
   * Métodos abstratos que as subclasses (ex: MutationChatbotDetect) devem implementar
   */
  public abstract init(): Promise<P>;
  public abstract setup(target: Node, timeoutManager: TimeoutManager<P>): void;
  public abstract cancelMutationObserver(): void;

  /**
   * Regista um listener para eventos específicos de mutação
   */
  public on(event: DetailedMutationEvent, handler: MutationHandler): void {
    const existingHandlers = this.handlers.get(event) || [];
    existingHandlers.push(handler);
    this.handlers.set(event, existingHandlers);
  }

  /**
   * Emite eventos capturados pelo MutationObserver
   */
  private emit(event: DetailedMutationEvent, mutation: MutationRecord): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(mutation);
      }
    }
  }

  /**
   * Callback central do MutationObserver nativo
   */
  protected mutationCallback = (mutations: MutationRecord[]): void => {
    if (this.isDisconnecting) return;

    for (const mutation of mutations) {
      const processor = MUTATION_PROCESSOR_REGISTRY[mutation.type];
      if (processor) {
        processor.process(mutation, (event: string, mut: MutationRecord) =>
          this.emit(event as DetailedMutationEvent, mut),
        );
      }
    }
  };

  /**
   * Aguarda que o observer seja desligado ou o sinal de abort seja emitido.
   * Não altera métodos nativos (No Monkey Patching).
   *//*
  protected waitForObserverDisconnect(signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // 1. Verificação imediata
      if (signal?.aborted) return reject(new CancellationError());
      if (!this.observer) return resolve();

      // 2. Configuração de estado para resolução externa
      this.resolveWaitingPromise = resolve;
      this.rejectWaitingPromise = reject;

      // 3. Gestão do AbortSignal
      this.abortHandler = () => {
        this.internalCleanup();
        if (this.rejectWaitingPromise) {
          this.rejectWaitingPromise(new CancellationError());
          this.resetPromiseControls();
        }
      };

      signal?.addEventListener('abort', this.abortHandler, { once: true });
    });
  }
    */
   protected waitForObserverDisconnect(signal?: AbortSignal): Promise<{ cancelled: boolean }> {
  return new Promise((resolve) => {
    // Se já estiver cancelado, resolvemos com a flag
    if (signal?.aborted) return resolve({ cancelled: true });

    const onAbort = () => {
      this.cleanup();
      resolve({ cancelled: true }); // RESOLVE em vez de Reject
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    this.resolveWaitingPromise = () => {
      signal?.removeEventListener('abort', onAbort);
      this.internalCleanup();
      resolve({ cancelled: false });
    };
  });
}

  /**
   * Desliga o observer de forma limpa e resolve a Promise pendente.
   */
  public disconnect(): void {
    this.internalCleanup();
    
    if (this.resolveWaitingPromise) {
      this.resolveWaitingPromise();
      this.resetPromiseControls();
    }
  }

  /**
   * Limpeza interna de recursos
   */
  private internalCleanup(): void {
    this.isDisconnecting = true;
    
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.timeoutManager) {
      this.timeoutManager.stopTimeout();
    }
  }

  /**
   * Cleanup público para uso em blocos catch/finally
   */
  protected cleanup(): void {
    try {
      this.internalCleanup();
      this.resetPromiseControls();
    } catch (error) {
      // Silenciosamente ignora erros no cleanup
    }
  }

  private resetPromiseControls(): void {
    this.resolveWaitingPromise = null;
    this.rejectWaitingPromise = null;
    this.abortHandler = null;
  }
}

export default AbstractMutationObserver;