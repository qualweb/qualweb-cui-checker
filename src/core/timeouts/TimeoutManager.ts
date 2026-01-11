import { InstanceNotInitializedError } from '../../errors/content/errors.class.content';

class TimeoutManager<T> {
  private timeout?: NodeJS.Timeout;
  private maxTime: number;
  private callBack?: () => Promise<T> | T;

  constructor(maxTime: number) {
    this.maxTime = maxTime;
    this.callBack = undefined;
  }
  setup(disconnect: () => T) {
    this.callBack = disconnect;
  }

  startTimeout() {
    if (!this.callBack) {
      throw new InstanceNotInitializedError('Callback not set up.');
    }
    this.timeout = setTimeout(this.callBack, this.maxTime);
  }

  restartTimeout() {
    clearTimeout(this.timeout);
    this.startTimeout();
  }

  stopTimeout() {
    clearTimeout(this.timeout);
  }

  async executeCallback(): Promise<T> {
    if (!this.callBack) {
      throw new InstanceNotInitializedError('Callback not set up.');
    }
    this.stopTimeout();
    return this.callBack();
  }

  setMaxTime(maxTime: number) {
    this.maxTime = maxTime;
  }
}
export default TimeoutManager;
