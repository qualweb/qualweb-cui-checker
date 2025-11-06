import {AIMessage, isAIMessage, isToolMessage} from "@langchain/core/messages";

import {GraphState} from "./state";

/**
 *
 * @param state
 * @returns
 */
export const routing = async (state: typeof GraphState.State) => {
    const {currentObjective, isFirstMessage} = state;
    if (isFirstMessage) {
        return "domain_obtainer";
    }
    if (currentObjective == null) {
        return "objective_assigner";


    } else {
        /* TODO: ,Logic for agent_reviewer
        if( state.currentObjective.counter > 2){
          // If the current objective has been attempted 2 times, escalate to agent
          // Agent will review objective last messages and provide feedback

          return "agent_reviewer";
        }*/
    }

    return "objective_achiever";
}
export const getStepAfterAchiever = async (state: typeof GraphState.State) => {
    const {currentEvaluationObjective} = state;
    if (currentEvaluationObjective) {
        return "qw_browser_test";

    } else {

        return "objective_assigner";
    }
}
export const decideNextStepAfterObjectiveAssigner = (state: typeof GraphState.State) => {
    const {currentObjective, status} = state;
    if (currentObjective === null || status == "completed") {
        return "output_preparer";
    }
    return "strategy_formulator";
}
export const chooseNextStepGatherInfo = (state: typeof GraphState.State) => {
    const {messages} = state;
    const lastMessage = messages[messages.length - 1];

    if (!isAIMessage(lastMessage)) {
        throw new Error("Expected the last message to be an AI message");
    }
    const messageCastAI = lastMessage as AIMessage;
    // Does the last message contain tool calls?
    // If it does, we can assume that the agent has decided to use a tool
    // else we can assume that the agent has decided to ask a question
    if (
        messageCastAI &&
        "tool_calls" in messageCastAI &&
        Array.isArray(messageCastAI.tool_calls) &&
        messageCastAI.tool_calls.length > 0
    ) {
        if (messageCastAI.tool_calls[0].name === "Search_Assistant_Services") {
            return "tools";

        }
        if (messageCastAI.tool_calls[0].name === "Ask_Assistant_Context") {
            return "tools";

        }
    }

    return "strategy_formulator";
}
export const chooseNextStepAfterTool = (state: typeof GraphState.State) => {
    const {messages} = state;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && isToolMessage(lastMessage)) {
        if (lastMessage.name === "Ask_Assistant_Context") {
            return "ask_assistant_context";
        }
    }

    return "agent_reviewer";
};