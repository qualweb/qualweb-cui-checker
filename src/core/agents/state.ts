import { Annotation, MessagesAnnotation } from './langgraph_lib';
import { BaseMessage } from '@langchain/core/messages';
import { StatusGraph, STATUS_GRAPH } from './domain/types';
import { TGraphInput } from './domain/GraphInput/types';
import { IQWGraphOutput } from './domain/GraphOutput/types';
import { generateQualWebTests, ObjectiveSerialized } from './domain/ObjectiveBuilder';

let QUALWEB_TESTS: Record<string, ObjectiveSerialized>;
export function initCUISpeechRecognitionTests(useRecognitionTests: boolean = false) {
  QUALWEB_TESTS = generateQualWebTests(useRecognitionTests);
}

export const GraphState = Annotation.Root({
  ...MessagesAnnotation.spec,

  graphInput: Annotation<TGraphInput>({
    reducer: (_prev, next) => next,
  }),
  // Messages in the conversation history
  // This is a list of messages exchanged between the Agent and the Assistant
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  // Map of objectives, where the key is the objective ID and the value is the Objective object
  objectives: Annotation<Record<string, ObjectiveSerialized>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => QUALWEB_TESTS,
  }),
  // Important context gathered during the conversation
  importantContext: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  // The current objective being pursued by the agent
  // This is the objective that the agent is currently working on
  currentObjective: Annotation<ObjectiveSerialized | null>({
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
  // Strategy para o question formulator
  strategy: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  graphOutput: Annotation<IQWGraphOutput>({
    reducer: (_prev, next) => next,
    default: () => ({
      status: STATUS_GRAPH.NOT_STARTED,
      actions: [],
    }),
  }),
  status: Annotation<StatusGraph>({
    reducer: (_prev, next) => next,
    default: () => STATUS_GRAPH.NOT_STARTED,
  }),
  isSkipObjectivePressed: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
});
