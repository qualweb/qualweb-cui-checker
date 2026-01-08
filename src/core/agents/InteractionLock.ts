export class InteractionLock {
  private static readonly KEY = 'qw_cui_ui_interaction_busy';
  private static readonly TTL = 5000;

  static async acquire(): Promise<boolean> {
    const data = await chrome.storage.session.get([this.KEY]);
    const now = Date.now();
    const lock = data[this.KEY];
    console.log('Acquiring Interaction Lock:', lock, now);
    if (lock && now < lock + this.TTL) {
      console.log('Interaction Lock is already acquired.');
      return false;
    }
    console.log('Acquiring Interaction Lock now.');
    await this.refresh();
    return true;
  }

  static async refresh(ttl?: number): Promise<void> {
    console.log('Refreshing Interaction Lock');
    // Define/Renova o tempo de expiração
    await chrome.storage.session.set({ [this.KEY]: Date.now() + (ttl ?? this.TTL) });
  }

  static async release(): Promise<void> {
    await chrome.storage.session.remove(this.KEY);
  }

  static async isLocked(): Promise<boolean> {
    const data = await chrome.storage.session.get([this.KEY]);
    const now = Date.now();
    const lock = data[this.KEY];

    return !!(lock && now < lock + this.TTL);
  }
}