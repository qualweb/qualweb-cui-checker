import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ALL_TOOLS_LIST } from "./tools";
import { StateGraph, START, END } from "./langgraph_lib";
import { GraphState } from "./state";
import {
  chooseNextStepAfterTool,
  chooseNextStepGatherInfo,
  decideNextStepAfterObjectiveAssigner,
  getStepAfterAchiever,
  routing,
} from "./routing";

import {
  agentReviewer,
  askAssistantForMoreInfo,
  callQuestionFormulator,
  domain_obtainer,
  getNextObjective,
  humanSkipInterrupt,
  objectiveAchiever,
  prepareOutputMessage,
  QwBrowserTest,
  strategyFormulator,
} from "./nodes";
import {  QwSpeechRecognitionTestNode } from "./nodes/qw-browser-recognition-test";
import { LanggraphNode as Node } from "./nodes/NodeNames";
import { initialNode } from "./nodes/initial_node";


const toolNode = new ToolNode(ALL_TOOLS_LIST);
export const workflow = new StateGraph(GraphState)
  .addNode(Node.DOMAIN_OBTAINER, domain_obtainer)
  .addNode(Node.QW_BROWSER_TEST, QwBrowserTest)
  .addNode(Node.QW_BROWSER_RECOGNITION_TEST, QwSpeechRecognitionTestNode )
  .addNode(Node.OBJECTIVE_ACHIEVER, objectiveAchiever)
  .addNode(Node.OBJECTIVE_ASSIGNER, getNextObjective)
  .addNode(Node.AGENT_REVIEWER, agentReviewer)
  .addNode(Node.STRATEGY_FORMULATOR, strategyFormulator)
  .addNode(Node.QUESTION_FORMULATOR, callQuestionFormulator)
  .addNode(Node.HUMAN_SKIP_INTERRUPT_STRATEGY, humanSkipInterrupt)
  .addNode(Node.HUMAN_SKIP_INTERRUPT_QUESTION, humanSkipInterrupt)
  .addNode(Node.ASK_ASSISTANT_CONTEXT, askAssistantForMoreInfo)
  .addNode(Node.TOOLS, toolNode)
  .addNode(Node.OUTPUT_PREPARER, prepareOutputMessage)
 /* .addNode(Node.INITIAL_ROUTER, async () => {
    return { graphOutput: null };
  })*/
  .addNode(Node.INITIAL_ROUTER, initialNode)
  .addEdge(START, Node.INITIAL_ROUTER)
  .addConditionalEdges(Node.INITIAL_ROUTER, routing, [
    Node.OBJECTIVE_ASSIGNER,
    Node.OBJECTIVE_ACHIEVER,
    Node.DOMAIN_OBTAINER,
    Node.AGENT_REVIEWER,
  ])
  .addConditionalEdges(Node.OBJECTIVE_ACHIEVER, getStepAfterAchiever, [
    Node.OBJECTIVE_ASSIGNER,
    Node.QW_BROWSER_TEST,
    Node.QW_BROWSER_RECOGNITION_TEST
  ])
  .addEdge(Node.DOMAIN_OBTAINER, Node.OBJECTIVE_ASSIGNER)
  .addEdge(Node.QW_BROWSER_TEST, Node.OBJECTIVE_ASSIGNER)
  .addEdge(Node.QW_BROWSER_RECOGNITION_TEST, Node.OBJECTIVE_ASSIGNER)
  .addConditionalEdges(
    Node.OBJECTIVE_ASSIGNER,
    decideNextStepAfterObjectiveAssigner,
    [Node.STRATEGY_FORMULATOR, Node.OUTPUT_PREPARER],
  )
  .addConditionalEdges(Node.AGENT_REVIEWER, chooseNextStepGatherInfo, [
    Node.TOOLS,
    Node.STRATEGY_FORMULATOR,
  ])
  .addConditionalEdges(Node.TOOLS, chooseNextStepAfterTool, [
    Node.AGENT_REVIEWER,
    Node.ASK_ASSISTANT_CONTEXT,
  ])
  .addEdge(Node.ASK_ASSISTANT_CONTEXT, Node.OUTPUT_PREPARER)
  .addEdge(Node.STRATEGY_FORMULATOR, Node.HUMAN_SKIP_INTERRUPT_STRATEGY)
  .addConditionalEdges(
    Node.HUMAN_SKIP_INTERRUPT_STRATEGY,
    (state: typeof GraphState.State) => {
      if (!state.currentObjective) {
        return Node.INITIAL_ROUTER;
      }
      return Node.QUESTION_FORMULATOR;
    },
    [
      Node.QUESTION_FORMULATOR, 
      Node.INITIAL_ROUTER
    ],
  )
  .addEdge(Node.QUESTION_FORMULATOR, Node.HUMAN_SKIP_INTERRUPT_QUESTION)
  .addConditionalEdges(
    Node.HUMAN_SKIP_INTERRUPT_QUESTION,
    (state: typeof GraphState.State) => {
      if (!state.currentObjective) {
        return Node.INITIAL_ROUTER;
      }
      return Node.OUTPUT_PREPARER;
    },
    [
      Node.INITIAL_ROUTER, 
      Node.OUTPUT_PREPARER
    ],
  )
  .addEdge(Node.OUTPUT_PREPARER, END);