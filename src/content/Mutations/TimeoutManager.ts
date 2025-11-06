
class TimeoutManager<T> {
    private timeout?: NodeJS.Timeout;
    private maxTime:number;
    private callBack:()=>Promise<T>;

    constructor(callBack:()=>Promise<T>,maxTime:number = 5000){
        this.callBack = callBack;
        this.maxTime = maxTime;
    }

    startTimeout(){
      this.timeout=  setTimeout(this.callBack, this.maxTime);
    }

    restartTimeout(){
      clearTimeout(this.timeout);
      this.startTimeout();
    }

    stopTimeout(){
        clearTimeout(this.timeout);
    }

    async executeCallback():Promise<T>{
      this.stopTimeout();
      return this.callBack();
    }

    setMaxTime(maxTime:number){
        this.maxTime = maxTime;

    }
    

}
export default TimeoutManager;