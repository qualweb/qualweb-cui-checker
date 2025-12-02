import { BaseMessage } from '@langchain/core/messages';
import objectives from './objectives.json';

export type TestOutcome = 'passed' | 'failed' | 'warning' | 'inapplicable';

interface TestConditions {
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
  code: string;
  selector: string;
  conditions?: TestConditions;
  outcome?: TestOutcome;
}

export interface Objective {
  // Check Name of Objective for identification of current test for UI status
  check: string;
  // Title of Objective
  title: string;
  // Text explaining objective
  objective: string;
  // requirements to pass objective
  requirements: string;
  // Exceptions
  exceptions: string;
  // status of objective
  status: ObjectiveStatus;
  // Browser Cui Check
  test?: QwBrowserTest;
}

export interface ObjectiveStatus {
  completed: boolean;
  failed: boolean;
  counter: number;
}

export interface EvaluationTest {
  message: BaseMessage;
  objective: Objective;
}

export type GraphStatus = 'running' | 'completed' | 'failed';

export interface FinalOutput {
  response: string;
  lastMesssagePassedCheck: string | null | QwBrowserTest;
  status: GraphStatus;
}

export const objectivesDefault: Record<string, Objective> = objectives as Record<string, Objective>;
