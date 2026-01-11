import QWStandardTest from './QWStandardTest';
import { TEST_TYPE, TestConditions } from './types';
import { ISerializable } from '../ISerializable';
import BrowserTest, { TypeTestOutcome } from './browser-tests/BrowserTest';

class QWBrowserTest extends QWStandardTest implements ISerializable {
  readonly _type: string = TEST_TYPE.QW_BROWSER_TEST;
  test: BrowserTest;
  constructor(
    check: string,
    title: string,
    selector: string,
    objective: string,
    requirements: string,
    exceptions: string,
    conditions: TestConditions,
    outcome?: TypeTestOutcome,
  ) {
    super(check, title, selector, objective, requirements, exceptions);
    this.test = new BrowserTest(conditions, outcome);
  }

  // getters and setters
  public getTest(): BrowserTest {
    return this.test;
  }

  public toJSON(): object {
    const obj: any = {
      ...super.toJSON(),
      test: this.test.toJSON(),
    };
    obj['_type'] = this._type;
    return obj;
  }
}
export default QWBrowserTest;
