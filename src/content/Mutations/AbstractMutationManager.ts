

// Base Structure for Class with responsibility of managing mutation observer

import TimeoutManager from "./TimeoutManager";
import { DetailedMutationEvent, MUTATION_PROCESSOR_REGISTRY, MutationHandler } from "./Types";

// Should be static
abstract class AbstractMutationObserver<P> {

    protected timeoutManager: TimeoutManager<void | P> | null = null;

    protected observer: MutationObserver | null = null;

    private handlers: Map<DetailedMutationEvent, MutationHandler[]> = new Map();

    abstract init(target: Node): Promise<P>;
    
    public on(event: DetailedMutationEvent, handler: MutationHandler): void {
        const existingHandlers = this.handlers.get(event) || [];
        existingHandlers.push(handler);
        this.handlers.set(event, existingHandlers);
    }

    private emit(event: DetailedMutationEvent, mutation: MutationRecord): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            for (const handler of handlers) {
                handler(mutation);
            }
        }
    }

    public mutationCallback = (mutations: MutationRecord[]): void => {
        for (const mutation of mutations) {
            const processor = MUTATION_PROCESSOR_REGISTRY[mutation.type];
            if (processor) {
                processor.process(mutation, (event: string, mutation: MutationRecord) => this.emit(event as DetailedMutationEvent, mutation));
            }
        }
    }

    protected waitForObserverDisconnect(): Promise<void> {
        return new Promise<void>((resolve) => {
        // Store original disconnect
        const originalDisconnect = this.observer!.disconnect.bind(this.observer);
        // Override disconnect to resolve promise
        this.observer!.disconnect = () => {
        originalDisconnect();
        resolve();
        };
        });
    }

    protected disconnect(): void {
        this.observer?.disconnect();
        this.observer = null;
    }

    public abstract cancelMutationObserver(): void;

}

export default AbstractMutationObserver;