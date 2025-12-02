import { Annotation, MessagesAnnotation } from '@langchain/langgraph/web';
import { BaseMessage } from '@langchain/core/messages';
import {
  EvaluationTest,
  FinalOutput,
  GraphStatus,
  Objective,
  objectivesDefault,
} from './objectives';

export const GraphState = Annotation.Root({
  ...MessagesAnnotation.spec,

  isFirstMessage: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => true,
  }),
  // Messages in the conversation history
  // This is a list of messages exchanged between the Agent and the Assistant
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  // Map of objectives, where the key is the objective ID and the value is the Objective object
  objectives: Annotation<Record<string, Objective>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => objectivesDefault,
  }),
  // Important context gathered during the conversation
  importantContext: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  // The current objective being pursued by the agent
  // This is the objective that the agent is currently working on
  currentObjective: Annotation<Objective | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  currentObjectiveMessages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => {
      if (Array.isArray(next)) {
        if (next.length === 0) {
          return [];
        } else {
          return [...prev, ...next];
        }
      }
      return [...prev, next];
    },
    default: () => [],
  }),
  //Test Evaluation Objective for QW Browser test Node
  currentEvaluationObjective: Annotation<EvaluationTest | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  // Strategy para o question formulator
  strategy: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  objectiveAchieved: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  finalOutput: Annotation<FinalOutput | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  status: Annotation<GraphStatus>({
    reducer: (_prev, next) => next,
    default: () => 'running',
  }),
  isSkipObjectivePressed: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
});
