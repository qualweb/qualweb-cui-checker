import QWBrowserTest from './QWBrowserTest';
import QWRecognitionTest from './QWRecognitionTest';
import QWStandardTest from './QWStandardTest';
import { TypeTestOutcome } from './browser-tests/BrowserTest';

import QWTest from './base/QWTest';
import {
  IStatusObjective,
  ObjectiveSerialized,
  ObjectType,
  QWBrowserTestRAW,
  QWRecognitionTestRAW,
  RawQWStandardTestData,
} from '../ObjectiveBuilder';
import { StatusTest } from '../types';
import { TEST_TYPE } from './types';

export type QWTestType = QWStandardTest | QWRecognitionTest | QWBrowserTest;

type DeserializerFn = (data: ObjectiveSerialized) => QWTestType;

class TestRegistry {
  private static readonly deserializers = new Map<string, DeserializerFn>();

  /**
   * Register a deserializer for a test type
   */
  static register(type: string, deserializer: DeserializerFn): void {
    this.deserializers.set(type, deserializer);
  }

  /**
   * Deserialize a single test object
   */
  static deserialize(data: ObjectiveSerialized): QWTestType {
    const deserializer = this.deserializers.get(data._type);

    if (!deserializer) {
      throw new Error(
        `No deserializer registered for type: ${data._type}. ` +
          `Available types: ${Array.from(this.deserializers.keys()).join(', ')}`,
      );
    }

    const instance = deserializer(data);

    return instance;
  }

  /**
   * Deserialize from JSON string
   */
  static fromJSON(json: string): QWTest {
    const data = JSON.parse(json);
    return this.deserialize(data);
  }

  /**
   * Get all registered types
   */
  static getRegisteredTypes(): string[] {
    return Array.from(this.deserializers.keys());
  }

  /**
   * Check if a type is registered
   */
  static isRegistered(type: string): boolean {
    return this.deserializers.has(type);
  }
}

export default TestRegistry;

// Register default deserializers
TestRegistry.register(TEST_TYPE.QW_STANDARD_TEST, (data: ObjectiveSerialized) => {
  const typedData = data as RawQWStandardTestData & ObjectType & IStatusObjective;
  const instance = new QWStandardTest(
    typedData.check,
    typedData.title,
    typedData.selector,
    typedData.objective,
    typedData.requirements,
    typedData.exceptions,
  );
  if (typedData.status) {
    instance.setStatus(typedData.status as unknown as StatusTest);
  }
  if (typedData.counterExecution !== undefined) {
    instance.setCounterExecution(typedData.counterExecution);
  }
  return instance;
});

TestRegistry.register(TEST_TYPE.QW_BROWSER_TEST, (data: ObjectiveSerialized) => {
  const typedData = data as QWBrowserTestRAW & ObjectType & IStatusObjective;
  const instance = new QWBrowserTest(
    typedData.check,
    typedData.title,
    typedData.selector,
    typedData.objective,
    typedData.requirements,
    typedData.exceptions,
    typedData.test.conditions,
    typedData.test.outcome ? (typedData.test.outcome as unknown as TypeTestOutcome) : undefined,
  );
  if (typedData.test.chatbotResponse) {
    instance.getTest().setChatbotResponse(typedData.test.chatbotResponse);
  }
  if (typedData.test.outcome) {
    instance.getTest().setOutcome(typedData.test.outcome as unknown as TypeTestOutcome);
  }
  if (typedData.status) {
    instance.setStatus(typedData.status as unknown as StatusTest);
  }
  if (typedData.counterExecution !== undefined) {
    instance.setCounterExecution(typedData.counterExecution);
  }
  return instance;
});

TestRegistry.register(TEST_TYPE.QW_RECOGNITION_TEST, (data: ObjectiveSerialized) => {
  const typedData = data as QWRecognitionTestRAW & ObjectType & IStatusObjective;

  const instance = new QWRecognitionTest(
    typedData.check,
    typedData.title,
    typedData.selector,
    typedData.test.conditions,
    typedData.test.transcript,
    typedData.test.expectedResponse,
    typedData.test.locale,
    typedData.test.audioFilename,
  );
  if (typedData.test.chatbotResponse) {
    instance.getTest().setChatbotResponse(typedData.test.chatbotResponse);
  }
  if (typedData.test.outcome) {
    instance.getTest().setOutcome(typedData.test.outcome as unknown as TypeTestOutcome);
  }
  if (typedData.status) {
    instance.setStatus(typedData.status as unknown as StatusTest);
  }
  if (typedData.counterExecution !== undefined) {
    instance.setCounterExecution(typedData.counterExecution);
  }
  return instance;
});
