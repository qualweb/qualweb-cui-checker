import { AIMessage, isAIMessage, isToolMessage } from '@langchain/core/messages';

import { GraphState } from './state';
import { STATUS_GRAPH, STATUS_TEST } from './domain/types';
import TestRegistry from './domain/QWTests/TestRegistry';
import QWRecognitionTest from './domain/QWTests/QWRecognitionTest';
import QWBrowserTest from './domain/QWTests/QWBrowserTest';
import { LanggraphNode as Node } from './nodes/NodeNames';

/**
 *
 * @param state
 * @returns
 */
export const routing = async (state: typeof GraphState.State) => {
  const { currentObjective } = state;
  // Is it the first message of assistant?
  if (state.status === STATUS_GRAPH.NOT_STARTED) {
    return Node.DOMAIN_OBTAINER;
  }
  // if there is no current objective, get one
  if (currentObjective == null) {
    return Node.OBJECTIVE_ASSIGNER;
  }

  return Node.OBJECTIVE_ACHIEVER;
};

export const getStepAfterAchiever = async (state: typeof GraphState.State) => {
  const { currentObjective, graphOutput } = state;
  if (currentObjective == null) {
    return Node.OBJECTIVE_ASSIGNER;
  }
  const objective = TestRegistry.deserialize(currentObjective);

  if (objective instanceof QWRecognitionTest) {
    return Node.QW_BROWSER_RECOGNITION_TEST;
  } else if (objective instanceof QWBrowserTest) {
    if (graphOutput) {
      return Node.QW_BROWSER_TEST;
    } else {
      return Node.OBJECTIVE_ASSIGNER;
    }
  } else {
    return Node.OBJECTIVE_ASSIGNER;
  }
};
export const decideNextStepAfterObjectiveAssigner = (state: typeof GraphState.State) => {
  const { currentObjective, status } = state;

  if (currentObjective === null || status == STATUS_GRAPH.COMPLETED) {
    return Node.OUTPUT_PREPARER;
  }
  const qwTest = TestRegistry.deserialize(currentObjective);
  if (qwTest instanceof QWRecognitionTest) {
    return Node.OUTPUT_PREPARER;
  }
  return Node.STRATEGY_FORMULATOR;
};
export const chooseNextStepGatherInfo = (state: typeof GraphState.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];

  if (!isAIMessage(lastMessage)) {
    throw new Error('Expected the last message to be an AI message');
  }
  const messageCastAI = lastMessage as AIMessage;
  // Does the last message contain tool calls?
  // If it does, we can assume that the agent has decided to use a tool
  // else we can assume that the agent has decided to ask a question
  if (
    messageCastAI &&
    'tool_calls' in messageCastAI &&
    Array.isArray(messageCastAI.tool_calls) &&
    messageCastAI.tool_calls.length > 0
  ) {
    if (messageCastAI.tool_calls[0].name === 'Search_Assistant_Services') {
      return Node.TOOLS;
    }
    if (messageCastAI.tool_calls[0].name === 'Ask_Assistant_Context') {
      return Node.TOOLS;
    }
  }

  return Node.STRATEGY_FORMULATOR;
};
export const chooseNextStepAfterTool = (state: typeof GraphState.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && isToolMessage(lastMessage)) {
    if (lastMessage.name === 'Ask_Assistant_Context') {
      return Node.ASK_ASSISTANT_CONTEXT;
    }
  }

  return Node.AGENT_REVIEWER;
};

export const humanSkipRouting = (state: typeof GraphState.State) => {
  const { currentObjective } = state;

  if (currentObjective) {
  }

  return Node.AGENT_REVIEWER;
};
