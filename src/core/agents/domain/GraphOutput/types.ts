import { TypeTestOutcome } from '../QWTests/browser-tests/BrowserTest';
import { StatusGraph } from '../types';

export interface IQWGraphOutput {
  status: StatusGraph;
  actions: GraphOutputAction[];
}
export const ACTION_TYPE = {
  PLAY_SOUND_ACTION: 'PlaySoundAction',
  QUESTION_ACTION: 'QuestionAction',
  MARK_ELEMENT_ACTION: 'MarkElementAction',
  SET_BROWSER_TEST_OUTCOME_ACTION: 'SetBrowserTestOutcomeAction',
} as const;

export interface IPlaySoundAction {
  _type: typeof ACTION_TYPE.PLAY_SOUND_ACTION;
  audioFilename: string;
}

export interface IQuestionAction {
  _type: typeof ACTION_TYPE.QUESTION_ACTION;
  question: string;
}

export interface IMarkElementAction {
  _type: typeof ACTION_TYPE.MARK_ELEMENT_ACTION;
  selector: string;
  check: string;
}

export interface ISetBrowserTestOutcomeAction {
  _type: typeof ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION;
  check: string;
  selector: string;
  outcome: TypeTestOutcome;
}

export type GraphOutputAction =
  | IPlaySoundAction
  | IQuestionAction
  | IMarkElementAction
  | ISetBrowserTestOutcomeAction;
