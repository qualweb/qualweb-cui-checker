import { ACTION_TYPE, IQuestionAction } from '../types';
import BaseAction from './BaseAction';

class QuestionAction extends BaseAction implements IQuestionAction {
  readonly _type = ACTION_TYPE.QUESTION_ACTION;
  question: string;

  constructor(question: string) {
    super();
    this.question = question;
  }
  getQuestion(): string {
    return this.question;
  }

  toJSON(): object {
    return {
      _type: this._type,
      question: this.question,
    };
  }
}

export default QuestionAction;
