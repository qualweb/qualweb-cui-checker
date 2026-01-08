import QWTest from "./base/QWTest";
import { ISerializable } from "../ISerializable";
import { TEST_TYPE } from "./types";

class QWStandardTest extends QWTest implements ISerializable {
  readonly _type: string = TEST_TYPE.QW_STANDARD_TEST;
  private readonly objective: string;
  private readonly requirements: string;
  private readonly exceptions: string;

  constructor(
    check: string,
    title: string,
    selector:string,
    objective: string,
    requirements: string,
    exceptions: string,
  ) {
    super(check, title,selector);
    this.objective = objective;
    this.requirements = requirements;
    this.exceptions = exceptions;
  }
  public getObjective(): string {
    return this.objective;
  }
  public getRequirements(): string {
    return this.requirements;
  }
  public getExceptions(): string {
    return this.exceptions;
  }

  public toJSON(): object {
    const obj: any = {
      ...super.toJSON(),
      objective: this.objective,
      requirements: this.requirements,
      exceptions: this.exceptions,
    };
    obj["_type"] = this._type;
    return obj;
  }
}

export default QWStandardTest;
