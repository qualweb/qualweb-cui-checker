import objectivesRaw from '../objectives/objectives.json';
import speechTestsRaw from '../objectives/speech-tests.json';
import { TestConditions, QwBrowserObjective, TEST_TYPE } from './QWTests/types';
import { STATUS_TEST, StatusTest } from './types';

/**
 * Qualweb Tests Interfaces
 */

export interface ObjectType {
  _type: string;
}

export interface IStatusObjective {
  selector: string;
  counterExecution: number;
  status: StatusTest;
}

export interface RawBrowserTestData {
  chatbotResponse?: string;
  conditions: TestConditions;
  outcome?: string;
}

export interface RawRecognitionTestData extends RawBrowserTestData {
  transcript: string;
  expectedResponse: string;
  locale: string;
  audioFilename: string;
}

export interface RawQWTestData {
  check: string;
  title: string;
}

export interface RawQWStandardTestData extends RawQWTestData {
  objective: string;
  requirements: string;
  exceptions: string;
}

export interface QWRecognitionTestRAW extends RawQWTestData {
  test: RawRecognitionTestData;
}
export type QuestionGenerationObjective = (RawQWStandardTestData | QWBrowserTestRAW) &
  ObjectType &
  IStatusObjective;

export interface QWBrowserTestRAW extends RawQWStandardTestData {
  test: RawBrowserTestData;
}

export type ObjectiveSerialized = (
  | RawQWStandardTestData
  | QWBrowserTestRAW
  | QWRecognitionTestRAW
) &
  ObjectType &
  IStatusObjective;

/**
 * Qualweb Speech Recognition Tests
 */

// Add field to each test
export function generateQualWebTests(
  flagIncludeSpeechTests: boolean,
): Record<string, ObjectiveSerialized> {
  const QUALWEB_TESTS: Record<string, ObjectiveSerialized> = {};
  if (flagIncludeSpeechTests) {
    const QUALWEB_SPEECH_BROWSER_TESTS: Record<string, QWRecognitionTestRAW> =
      speechTestsRaw as Record<string, QWRecognitionTestRAW>;

    // Populate QUALWEB_SPEECH_BROWSER_TESTS from speechTestsRaw
    for (const [key, value] of Object.entries(QUALWEB_SPEECH_BROWSER_TESTS)) {
      QUALWEB_TESTS[key] = {
        _type: TEST_TYPE.QW_RECOGNITION_TEST,
        ...value,
        selector: key,
        status: 'not_started',
        counterExecution: 0,
      };
    }
  }

  /** Objectives Qualweb tests and Qualweb Browser tests
   *
   */
  const QUALWEB_STANDARD_TESTS: Record<string, RawQWStandardTestData | QWBrowserTestRAW> =
    objectivesRaw as Record<string, RawQWStandardTestData | QWBrowserTestRAW>;

  /** Populate Qualweb Standard Tests  */
  for (const [key, value] of Object.entries(QUALWEB_STANDARD_TESTS)) {
    if (isQwBrowserObjective(value)) {
      QUALWEB_TESTS[key] = {
        _type: TEST_TYPE.QW_BROWSER_TEST,
        ...value,
        selector: key,
        status: STATUS_TEST.NOT_STARTED,
        counterExecution: 0,
      };
    } else {
      QUALWEB_TESTS[key] = {
        _type: TEST_TYPE.QW_STANDARD_TEST,
        ...value,
        selector: key,
        status: STATUS_TEST.NOT_STARTED,
        counterExecution: 0,
      };
    }
  }
  return QUALWEB_TESTS;
}
// Type Guard for QwBrowserObjective
export function isQwBrowserObjective(obj: any): obj is QwBrowserObjective {
  return obj && typeof obj === 'object' && 'test' in obj;
}
