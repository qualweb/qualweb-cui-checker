export class InteractionState {
  public controller: AbortController | null = null;
  public running: boolean = false;
  public currentRule: string = '';
  public currentTitle: string = '';
  public currentStatus: string = '';
   public skipInterrupt: boolean = false;
  public waitingOnStream: boolean = false;

  public createNewController() {
    if (this.controller) this.controller.abort(); 
    this.controller = new AbortController();
    this.running = true;
    return this.controller.signal;
  }

  public stop() {
    this.running = false;
    this.controller = null;
    this.waitingOnStream = false;
  }

  public fullReset() {
    this.abort();
    this.stop();
    this.currentRule = '';
    this.currentTitle = '';
    this.skipInterrupt = false;
    this.currentStatus = '';
    this.waitingOnStream = false;
  }

  public abort() {
    if (this.controller) {
      this.controller.abort();
    }
  }

  public updateObjective(rule: string, title: string) {
    this.currentRule = rule;
    this.currentTitle = title;
  }
}
