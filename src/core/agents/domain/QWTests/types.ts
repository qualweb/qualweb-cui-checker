type TestOutcome = 'passed' | 'failed' | 'warning' | 'inapplicable';

export interface TestConditions {
  // Description of when Test should be passed
  pass?: string;
  // Description of when Test should be warning
  warn?: string;
  // Description of when Test should be failed
  fail?: string;
  // Description of when Test should be inapplicable
  inapplicable?: string;
}

interface QwBrowserTest {
  chatbotResponse?: string;
  readonly selector: string;
  conditions?: TestConditions;
  outcome?: TestOutcome;
}

interface SpeechBrowserTest extends QwBrowserTest {
  // transcript of the audio input
  readonly transcript: string;
  // expected response or description of expected response
  readonly expectedResponse: string;
  // language locale of the audio input
  readonly locale: string;
  // filename
  readonly audioFilename: string;
}

interface ObjectiveBase {
  // Check Name of Objective for identification of current test for UI status
  check: string;
  // Title of Objective
  title: string;
  // status of objective
  status: ObjectiveStatus;
}

interface GenerateResponseObjective extends ObjectiveBase {
  // Text explaining objective
  objective: string;
  // requirements to pass objective
  requirements: string;
  // Exceptions
  exceptions: string;
}

interface ObjectiveStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  counter: number;
}

export interface QwBrowserObjective extends GenerateResponseObjective {
  // Browser Cui Check
  test: QwBrowserTest;
}

export interface RecognitionObjective extends ObjectiveBase {
  // Speech Browser Test
  test: SpeechBrowserTest;
}

export const TEST_TYPE = {
  QW_BROWSER_TEST: 'QWBrowserTest',
  QW_RECOGNITION_TEST: 'QWRecognitionTest',
  QW_STANDARD_TEST: 'QWStandardTest',
  QW_TEST: 'QWTest',
} as const;

export const BROWSER_TEST_TYPE = {
  BROWSER_TEST: 'BrowserTest',
  RECOGNITION_BROWSER_TEST: 'RecognitionBrowserTest',
} as const;
