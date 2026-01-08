class InterruptHandler {
  private static readonly abortControllers: Set<AbortController> = new Set();

  static  registerAbortController(controller: AbortController): void {
    InterruptHandler.abortControllers.add(controller);
  }

  static  unregisterAbortController(controller: AbortController): void {
    InterruptHandler.abortControllers.delete(controller);
  }
  static interruptController(controller: AbortController): void {
    controller.abort();
    InterruptHandler.unregisterAbortController(controller);
  }
  static interruptAll(): void {
    for (const controller of InterruptHandler.abortControllers) {
      controller.abort();
    }
    InterruptHandler.abortControllers.clear();
  }
}



export default InterruptHandler;