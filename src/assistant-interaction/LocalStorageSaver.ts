export class LocalStorageSaver {
  private key: string;

  constructor(key: string = 'langgraph-state') {
    this.key = key;
  }

  async save(state: unknown): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  async load(): Promise<unknown | null> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }
}

