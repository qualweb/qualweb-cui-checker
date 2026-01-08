
import { StatusTest } from "../../types";
import { ISerializable } from "../../ISerializable";
import { TEST_TYPE } from "../types";

abstract class QWTest implements ISerializable {
  readonly _type: string = TEST_TYPE.QW_TEST;
  private readonly check: string;
  private readonly title: string;
  private readonly selector: string;
  private counterExecution: number = 0;
  private status: StatusTest = "not_started";

  constructor(
    check: string,
    title: string,
    selector:string,
  ) {
    this.check = check;
    this.title = title;
    this.selector = selector;

  }
  public getCheck(): string {
    return this.check;
  }
  public getSelector(): string {
    return this.selector;
  }

  public getStatus(): StatusTest {
    return this.status;
  }
  public setStatus(status: StatusTest): void {
    this.status = status;
  }
  public setCounterExecution(counter: number): void {
    this.counterExecution = counter;
  }
  public getCounterExecution(): number {
    return this.counterExecution;
  }
  public incrementCounterExecution(): void {
    this.counterExecution += 1;
  }
  public getTitle(): string {
    return this.title;
  }

  public toJSON(): object {
    return {
      _type: this._type,
      check: this.check,
      title: this.title,
      selector: this.selector,
      status: this.status,
      counterExecution: this.counterExecution
    };
  }
}

export default QWTest;
