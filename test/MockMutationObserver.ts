class MockMutationObserver {
  private readonly callback:(mutations: MutationRecord[], observer: MutationObserver) => void;
  private intervalId:NodeJS.Timeout|null;
  constructor(callback:(mutations: MutationRecord[], observer: MutationObserver) => void) {
    this.callback = callback;
    this.intervalId = null;
  }

  observe(target, options) {
    this.intervalId = setInterval(() => {
      
      const mutationRecords = [
        {
          type: 'childList' as const,   // required
          target,                             // the node being observed
          addedNodes: [] as unknown as NodeList,   // must be NodeList
          removedNodes: [] as unknown as NodeList, // must be NodeList
          previousSibling: null,
          nextSibling: null,
          attributeName: null,
          attributeNamespace: null,
          oldValue: null
        }
      ];
      this.callback( mutationRecords, this);
    }, 1000);
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  takeRecords() {
    return [];
  }
}

export default MockMutationObserver;