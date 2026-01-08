import { BROWSER_TEST_TYPE, TestConditions } from "../types";
import BrowserTest, { TypeTestOutcome } from "./BrowserTest";
import { ISerializable } from "../../ISerializable";


class RecognitionBrowserTest extends BrowserTest implements ISerializable {
  readonly _type: string = BROWSER_TEST_TYPE.RECOGNITION_BROWSER_TEST;
  private readonly transcript: string;
  private readonly expectedResponse: string;
  private readonly locale: string;
  private readonly audioFilename: string;

  constructor(
    transcript: string,
    expectedResponse: string,
    locale: string,
    audioFilename: string,
    conditions: TestConditions,
    outcome?: TypeTestOutcome,
  ) {
    super(conditions, outcome);
    this.transcript = transcript;
    this.expectedResponse = expectedResponse;
    this.locale = locale;
    this.audioFilename = audioFilename;
  }

  public getTranscript(): string {
    return this.transcript;
  }

  public getExpectedResponse(): string {
    return this.expectedResponse;
  }

  public getLocale(): string {
    return this.locale;
  }

  public getAudioFilename(): string {
    return this.audioFilename;
  }

  public toJSON(): object {
       const obj: any = {
      ...super.toJSON(),
      transcript: this.transcript,
      expectedResponse: this.expectedResponse,
      locale: this.locale,
      audioFilename: this.audioFilename,
    };
        obj["_type"] = this._type;
    return obj;
  }
}

export default RecognitionBrowserTest;
