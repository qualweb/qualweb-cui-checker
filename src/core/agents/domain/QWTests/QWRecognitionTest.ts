import { TEST_TYPE, TestConditions } from "./types";
import QWTest from "./base/QWTest";
import { ISerializable } from "../ISerializable";
import RecognitionBrowserTest from "./browser-tests/RecognitionBrowserTest";

class QWRecognitionTest extends QWTest implements ISerializable {
  readonly _type: string = TEST_TYPE.QW_RECOGNITION_TEST;
  private readonly test: RecognitionBrowserTest;

  constructor(
    check: string,
    title: string,
    selector:string,
    conditions: TestConditions,
    transcript: string,
    expectedResponse: string,
    locale: string,
    audioFilename: string,
  ) {
    super(check, title,selector);
    this.test = new RecognitionBrowserTest(
      transcript,
      expectedResponse,
      locale,
      audioFilename,
      conditions,
    );
  }
  public getTest(): RecognitionBrowserTest {
    return this.test;
  }

  public toJSON(): object {
    const obj: any = {
      ...super.toJSON(),
      test:{...this.test.toJSON()},
    };
    obj["_type"] = this._type;
    return obj;
  }
}

export default QWRecognitionTest;
