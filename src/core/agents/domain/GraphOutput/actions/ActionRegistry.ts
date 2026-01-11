import {
  ACTION_TYPE,
  GraphOutputAction,
  IMarkElementAction,
  IPlaySoundAction,
  IQuestionAction,
  ISetBrowserTestOutcomeAction,
} from '../types';
import BaseAction from './BaseAction';
import MarkElementAction from './MarkElementAction';
import PlaySoundAction from './PlaySoundAction';
import QuestionAction from './QuestionAction';
import SetBrowserTestOutcomeAction from './SetBrowserTestOutcome';

type DeserializerFn = (data: GraphOutputAction) => BaseAction;

class ActionRegistry {
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
  static deserialize(data: GraphOutputAction): BaseAction {
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
   * Deserialize a single action array
   */
  static deserializeArray(data: GraphOutputAction[]): BaseAction[] {
    const results: BaseAction[] = [];
    if (data.length === 0) {
      return results;
    }
    for (const item of data) {
      results.push(this.deserialize(item));
    }
    return results;
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

export default ActionRegistry;

// Register default deserializers
ActionRegistry.register(
  ACTION_TYPE.MARK_ELEMENT_ACTION,
  (data: GraphOutputAction): MarkElementAction => {
    const typedData = data as IMarkElementAction;
    const instance = new MarkElementAction(typedData.check, typedData.selector);
    return instance;
  },
);

ActionRegistry.register(
  ACTION_TYPE.PLAY_SOUND_ACTION,
  (data: GraphOutputAction): PlaySoundAction => {
    const typedData = data as IPlaySoundAction;
    const instance = new PlaySoundAction(typedData.audioFilename);
    return instance;
  },
);

ActionRegistry.register(ACTION_TYPE.QUESTION_ACTION, (data: GraphOutputAction): QuestionAction => {
  const typedData = data as IQuestionAction;

  const instance = new QuestionAction(typedData.question);

  return instance;
});

ActionRegistry.register(
  ACTION_TYPE.SET_BROWSER_TEST_OUTCOME_ACTION,
  (data: GraphOutputAction): SetBrowserTestOutcomeAction => {
    const typedData = data as ISetBrowserTestOutcomeAction;
    const instance = new SetBrowserTestOutcomeAction(
      typedData.check,
      typedData.selector,
      typedData.outcome,
    );
    return instance;
  },
);
