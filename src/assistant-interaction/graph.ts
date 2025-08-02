import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  Annotation,
  END,
  MessagesAnnotation,
  MemorySaver,
  START,
  StateGraph,

} from "@langchain/langgraph/web";
import { LocalStorageSaver } from "./LocalStorageSaver";
import { AIMessage,HumanMessage, BaseMessage, isToolMessage, isHumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ALL_TOOLS_LIST } from "./tools";
import { LLM_Settings } from "../utils/types";
 import { isAIMessage } from "@langchain/core/messages";

const Settings:LLM_Settings = {
  model: "gpt-4o",
  apiKey: null,
  apiURL: "https://api.openai.com/v1",
  LLMService: "openai",
};
let llm: ChatOpenAI | null = null; // fora da função

export async function initiateLangraphSettings(settings: LLM_Settings) {
  Settings.apiKey = settings.apiKey;

  llm = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: settings.apiKey!,
  });

  return workflow.compile({
    checkpointer: new MemorySaver(),
  });
}

 



interface Objective {
  objective: string;
  completed: boolean;
  failed: boolean;
  counter: number;
} 


export type GraphStatus = "running" | "completed" | "failed";

export interface FinalOutput {
  response: string;
  lastMesssagePassedCheck: string| null;
  status: GraphStatus;

}

const objectivesDefault:Record<string,Objective> = {
 "qw-cui-date": {
    objective: "Obtain a response from the Assistant containing a date format",
    completed: false,
    failed: false,
    counter: 0,
  },  
  "qw-cui-unit": {
    objective: "Obtain a response from the Assistant containing a unit of measurement",
    completed: false,
    failed: false,
    counter: 0,
  },
   "qw-cui-currency": {
    objective: "Obtain a response from the Assistant containing a currency format",
    completed: false,
    failed: false,
    counter: 0,
  },
}

const GraphState = Annotation.Root({
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
  objectiveAchieved: Annotation<string|null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  finalOutput: Annotation<FinalOutput|null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  status: Annotation<GraphStatus>({
    reducer: (_prev, next) => next,
    default: () => "running",
  }),
});
 
const toolNode = new ToolNode(ALL_TOOLS_LIST);

const objectiveAchiever = async (state: typeof GraphState.State) => {
  // load next objective not completed

  const lastMessageHuman = state.messages[state.messages.length - 1];
  if(state.isFirstMessage) {
    state.isFirstMessage = false;

   const systemMessage = {
    role: "system",
    content:
      `Task : You receive messages from other assistant AI and based on
         the message you will give a short description of the entity or service provider and the services, offers or other that it offers and provides.`
  }; 
  const result = await llm!.invoke([systemMessage, lastMessageHuman as HumanMessage]);


    return {isFirstMessage:false, messages: [result] , objectiveAchieved:null };
      
      
  }
  if (state.currentObjective == null) {
    return { currentObjective: null };
  }
  const objectives = state.objectives;
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  // expect last message to be human message

 
  const systemMessage = {
    role: "system",
    content:
      `Task: Based on the current objective, you will analyse a message and conclude if the objective is achieved or not.
       Objective: ${state.currentObjective.objective}
       Instructions:
       the answer should be a boolean value, true if the objective is achieved, false otherwise.`
  }; 
  
  const result = await llm!.invoke([systemMessage, lastMessage as HumanMessage]);
   const updatedObjectives = { ...objectives };
   const currentObjectiveKey = Object.keys(objectives).find(
      key => objectives[key].objective === state.currentObjective!.objective
    );
   if (result.text.toLowerCase() === "true") {
     
    // If the objective is achieved, mark it as completed
    // Find the key for the current objective
   
    if (currentObjectiveKey) {
      updatedObjectives[currentObjectiveKey].completed = true;
    }
    return { objectives: updatedObjectives, currentObjective: null ,objectiveAchieved:currentObjectiveKey };
  }else{
    // If the objective is not achieved, mark it as failed

    if (currentObjectiveKey) {
      updatedObjectives[currentObjectiveKey].counter += 1;
    }
  }
  return { objectives: updatedObjectives, currentObjective: null ,objectiveAchieved:null };
}

const agentQuestion = async (state: typeof GraphState.State) => {
  const { messages } = state;

  if (messages.length > 10) {
    messages.splice(0, messages.length - 10);
  }

 const systemMessage = {
  role: "system",
  content: `
  You are a AI Agent that analyses messages of another assistant AI, based on last message you should make a strategy to pass to another agent for a question formulation.
  Based on the current objetive you should decide what is the next step to take to achieve the objective.
  objective: "${state.currentObjective?.objective || ""}".
  Important context: ${state.importantContext.join(", ")}.

  Based on the messages in the conversation history, you should:
  - Questions should be indirect and based on the context of the conversation with the objective in mind.
  - Do not repeat strategies that were already used.
  - Analyze the context and information provided.
`
}; 
  const result = await llm!.invoke([systemMessage, ...messages]);
  return { messages: [result] };
};



const callQuestionFormulator= async (state: typeof GraphState.State) => {
  const { messages } = state;

  const systemMessage = {
    role: "system",
   content:
         `Task:Based on history of messages formulate a short question to achieve objective.
          Objective: ${state.currentObjective?.objective}
          
          Instructions:
          - Analyze the messages in the conversation history.
          - Formulate a question that will help gather the necessary information to achieve the objective.
          - Short question, and you should use context from the messages like services and other events to ask indirectly about the objective.
          - Make sure the question is clear and specific.
          - Do not provide any additional information or context, just the question.
          - The question should be formulated in a way that the assistant can answer it directly.
          - Answer should be in language of the assistant according to message history.
      .`,
  }; 

  const result = await llm!.invoke([systemMessage, ...messages]);
  return { messages: [result] };
};


const askAssistantForMoreInfo = async (state: typeof GraphState.State,input:any) => {
  const { messages } = state;
  const strategy = input.strategy;

  const systemMessage = {
    role: "system",
    content:
      `Task: Based on the Strategy proposed and last messages, ask the assistant for more information about the services or help offered in relation to the entity to achieve the objective.
       Strategy: ${strategy}
       Objective: ${state.currentObjective?.objective || ""}
       Follow the instructions of Last message and make a short question for this in language of the user.
      .`,
  }; 
  const result = await llm!.invoke([systemMessage, ...messages]);
  return { messages: [result] };
};


const getNextObjective = async (state: typeof GraphState.State) => {
  // load next objective not completed
  const objectives = state.objectives;
  const nextObjective = Object.values(objectives).find(
    (objective): objective is Objective => typeof objective === "object" && objective !== null && "completed" in objective && !objective.completed
  );
  
  return { currentObjective: nextObjective ?? null , status: nextObjective ? "running" : "completed" };

};

const decideNextStepAfterNextObjective = (state: typeof GraphState.State) => {
  const { objectives,currentObjective } = state;
   if(!currentObjective){
    return "output_preparer";
   }
  return "agent"; 
}




const chooseNextStepGatherInfo = (state: typeof GraphState.State) => {
  const { messages } = state;
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

  return "question_formulator";
}

const chooseNextStepAfterTool = (state: typeof GraphState.State) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && isToolMessage(lastMessage)) {
    if(lastMessage.name === "Ask_Assistant_Context") {
      return "ask_assistant_context";
    }
  }

  return "agent"; 

};
const prepareOutputMessage = (state: typeof GraphState.State) => {
  const { messages,objectiveAchieved } = state;

  const lastMessage = messages[messages.length - 1];
  const finalOutputStructured = {
    response: lastMessage.text || null, 
    lastMesssagePassedCheck: objectiveAchieved,
    status: state.status,
  }as FinalOutput;

  return {finalOutput:finalOutputStructured}; 

};
const workflow = new StateGraph(GraphState)
  .addNode("objective_achiever", objectiveAchiever)
  .addNode("objective_assigner", getNextObjective)
  .addNode("agent", agentQuestion)
  .addNode("question_formulator", callQuestionFormulator)
  .addNode("ask_assistant_context", askAssistantForMoreInfo)
  .addNode("tools",toolNode)
  .addNode("output_preparer", prepareOutputMessage)
  .addEdge(START, "objective_achiever")
  .addEdge("objective_achiever", "objective_assigner")
  .addConditionalEdges(
    "objective_assigner",
    decideNextStepAfterNextObjective,
    [
      "agent", 
       "output_preparer",
    ]
  ) 
  .addConditionalEdges(
    "agent",
    chooseNextStepGatherInfo,
    [
      "tools", 
      "question_formulator",
    ]
  )
  .addConditionalEdges("tools",
    chooseNextStepAfterTool,
    ["agent", "ask_assistant_context"])
  .addEdge("ask_assistant_context", "output_preparer")
  .addEdge("question_formulator", "output_preparer")
  .addEdge("output_preparer", END)
  



