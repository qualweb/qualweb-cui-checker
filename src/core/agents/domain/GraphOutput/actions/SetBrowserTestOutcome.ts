import { TypeTestOutcome } from '../../QWTests/browser-tests/BrowserTest';
import BaseAction from './BaseAction';
import { ACTION_TYPE, ISetBrowserTestOutcomeAction } from '../types';

class SetBrowserTestOutcomeAction extends BaseAction implements ISetBrowserTestOutcomeAction {
  readonly _type = ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION;
  selector: string;
  check: string;
  outcome: TypeTestOutcome;

  constructor(check: string, selector: string, outcome: TypeTestOutcome) {
    super();
    this.check = check;
    this.selector = selector;
    this.outcome = outcome;
  }

  getSelector(): string {
    return this.selector;
  }

  getOutcome(): TypeTestOutcome {
    return this.outcome;
  }

  toJSON(): object {
    return {
      _type: this._type,
      check: this.check,
      selector: this.selector,
      outcome: this.outcome,
    };
  }
}

export default SetBrowserTestOutcomeAction;
