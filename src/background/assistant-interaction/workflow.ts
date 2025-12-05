import { END, START, StateGraph } from '@langchain/langgraph/web';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ALL_TOOLS_LIST } from './tools';
import { GraphState } from './state';
import {
  chooseNextStepAfterTool,
  chooseNextStepGatherInfo,
  decideNextStepAfterObjectiveAssigner,
  getStepAfterAchiever,
  routing,
} from './routing';

import {
  agentReviewer,
  askAssistantForMoreInfo,
  callQuestionFormulator,
  domain_obtainer,
  getNextObjective,
  objectiveAchiever,
  prepareOutputMessage,
  QwBrowserTest,
  strategyFormulator,
  humanSkipInterrupt,
} from './nodes';

const toolNode = new ToolNode(ALL_TOOLS_LIST);
export const workflow = new StateGraph(GraphState)
  .addNode('domain_obtainer', domain_obtainer)
  .addNode('qw_browser_test', QwBrowserTest)
  .addNode('objective_achiever', objectiveAchiever)
  .addNode('objective_assigner', getNextObjective)
  .addNode('agent_reviewer', agentReviewer)
  .addNode('strategy_formulator', strategyFormulator)
  .addNode('question_formulator', callQuestionFormulator)
  .addNode('human_skip_interrupt_strategy', humanSkipInterrupt)
  .addNode('human_skip_interrupt_question', humanSkipInterrupt)
  .addNode('ask_assistant_context', askAssistantForMoreInfo)
  .addNode('tools', toolNode)
  .addNode('output_preparer', prepareOutputMessage)
  .addNode('initial_router', async () => {
    return { finalOutput: null };
  })
  .addEdge(START, 'initial_router')
  .addConditionalEdges('initial_router', routing, [
    'objective_assigner',
    'objective_achiever',
    'qw_browser_test',
    'domain_obtainer',
    'agent_reviewer',
  ])
  .addConditionalEdges('objective_achiever', getStepAfterAchiever, [
    'objective_assigner',
    'qw_browser_test',
  ])
  .addEdge('domain_obtainer', 'objective_assigner')
  .addEdge('qw_browser_test', 'objective_assigner')
  .addConditionalEdges('objective_assigner', decideNextStepAfterObjectiveAssigner, [
    'strategy_formulator',
    'output_preparer',
  ])
  .addConditionalEdges('agent_reviewer', chooseNextStepGatherInfo, ['tools', 'strategy_formulator'])
  .addConditionalEdges('tools', chooseNextStepAfterTool, [
    'agent_reviewer',
    'ask_assistant_context',
  ])
  .addEdge('ask_assistant_context', 'output_preparer')
  .addEdge('strategy_formulator', 'human_skip_interrupt_strategy')
  .addConditionalEdges(
    'human_skip_interrupt_strategy',
    (state: typeof GraphState.State) => {
      if (!state.currentObjective) {
        return 'initial_router';
      }
      return 'question_formulator';
    },
    ['question_formulator', 'initial_router'],
  )
  .addEdge('question_formulator', 'human_skip_interrupt_question')
  .addConditionalEdges(
    'human_skip_interrupt_question',
    (state: typeof GraphState.State) => {
      if (!state.currentObjective) {
        return 'initial_router';
      }
      return 'output_preparer';
    },
    ['initial_router', 'output_preparer'],
  )
  .addEdge('output_preparer', END);
