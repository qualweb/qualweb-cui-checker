import { BROWSER_TEST_TYPE, TestConditions } from '../types';
import { ISerializable } from '../../ISerializable';

export const TEST_OUTCOME = {
  PASSED: 'passed',
  FAILED: 'failed',
  WARNING: 'warning',
  INAPPLICABLE: 'inapplicable',
} as const;

export type TypeTestOutcome = (typeof TEST_OUTCOME)[keyof typeof TEST_OUTCOME];

class BrowserTest implements ISerializable {
  readonly _type: string = BROWSER_TEST_TYPE.BROWSER_TEST;
  private chatbotResponse?: string;
  private readonly conditions: TestConditions;
  private outcome?: TypeTestOutcome;

  constructor(conditions: TestConditions, outcome?: TypeTestOutcome) {
    this.conditions = conditions;
    this.outcome = outcome;
  }

  public setChatbotResponse(response: string): void {
    this.chatbotResponse = response;
  }

  public getChatbotResponse(): string | undefined {
    return this.chatbotResponse;
  }

  public getOutcome(): TypeTestOutcome | undefined {
    return this.outcome;
  }
  public setOutcome(outcome: TypeTestOutcome): void {
    this.outcome = outcome;
  }

  public getConditions(): TestConditions {
    return this.conditions;
  }

  public getConditionsDescription(): string {
    let descriptions: string[] = [];
    if (this.conditions.pass) {
      descriptions.push(`Pass: ${this.conditions.pass}`);
    }
    if (this.conditions.warn) {
      descriptions.push(`Warning: ${this.conditions.warn}`);
    }
    if (this.conditions.fail) {
      descriptions.push(`Fail: ${this.conditions.fail}`);
    }
    if (this.conditions.inapplicable) {
      descriptions.push(`Inapplicable: ${this.conditions.inapplicable}`);
    }
    return descriptions.join(';\n');
  }

  public toJSON(): object {
    return {
      _type: this._type,
      conditions: this.conditions,
      outcome: this.outcome,
      chatbotResponse: this.chatbotResponse,
    };
  }
}

export default BrowserTest;
