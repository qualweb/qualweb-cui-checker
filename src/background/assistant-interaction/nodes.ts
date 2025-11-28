import {GraphState} from "./state";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {EvaluationTest, FinalOutput, Objective, TestOutcome} from "./objectives";
import {z} from "zod";
import {StructuredOutputParser} from "@langchain/core/output_parsers";
import {LLM,Settings} from "./graph"
import { NodeInterrupt } from "@langchain/langgraph/web";

/** Node responsible to obtain the domain of the current assistant.
 *  This node will only run in first message from assistant
 *
 * @param state
 * @returns
 */
export const domain_obtainer = async (state: typeof GraphState.State) => {
    const lastMessageHuman = state.messages[state.messages.length - 1];
    const OutputSchema = z.object({
        entity: z.string().nullable(),
        description: z.string().nullable(),
        services: z.array(z.string()).nullable(),
    });
    const parser = StructuredOutputParser.fromZodSchema(OutputSchema);
    const formatInstructions = parser.getFormatInstructions();
    LLM.model = "gpt-4o";
    LLM.temperature = 0;

    const systemMessage = {
        role: "system",
        content:
            `You will receive a URL and a message from an assistant AI. Your task is to extract and provide the following information:

        - Entity Name: the main name of the entity on the website.
        - Short Description: a very short description (1-2 sentences) of the entity, in the language of the website.
        - Services/Offers: a list of services, offers, or other features the entity provides, using acronyms and terms exactly as they appear on the site.

        Rules:
        - The description and list of services must be in Locale :  ${Settings.locale}.
        - Include acronyms and technical terms exactly as on the site.
        - If any information is not available, use null.
        - Be concise and clear.
        - This description should come from your knowledge and not from web search.

        Output:
        ${formatInstructions}`
    };
    const MAX_RETRIES = 2;
    let resultContent: any = null;
     for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
     try {
    const result = await LLM.invoke([systemMessage, lastMessageHuman as HumanMessage]);
    // TODO: treat execptions on Invalid JSON Schemma
    const content = typeof result.content === "string" ? result.content : result.content?.toString()

    resultContent = await parser.parse(content);
     } catch (e) {
        console.warn(`domain_obtainer: Attempt ${attempt + 1} failed. Error: ${e}`);
        if( attempt === MAX_RETRIES) throw e;
        systemMessage.content += `
        Note: Previous response was invalid. Please ensure the output strictly follows the specified format.`;
        continue; // retry
     }
     if (resultContent) {
        break;
     }
    }
    
    // Extract Fields
    const entityName = resultContent["entity"] || null;
    const shortDescription = resultContent["description"] || null;
    const servicesOffers = Array.isArray(resultContent["services"])
        ? resultContent["services"].join("\n")
        : resultContent["services"] || null;

    const context = `Entity: ${entityName}, Description: ${shortDescription}, Services: ${servicesOffers}`

    return {isFirstMessage: false, importantContext: [context], objectiveAchieved: null};
}
/**
 *
 * @param state
 * @returns
 */
export const QwBrowserTest = async (state: typeof GraphState.State) => {
    const {currentEvaluationObjective} = state;
    const currentObjective = currentEvaluationObjective?.objective;
    const lastMessage = currentEvaluationObjective?.message;

    // expect last message to be human message
    if (!currentObjective) {
        return {status: "completed"};
    }

    LLM.model = "gpt-4o";
    LLM.temperature = 0;
    
    const humanMessage =
        lastMessage instanceof HumanMessage
            ? lastMessage
            : new HumanMessage({content: lastMessage?.content ?? String(lastMessage)});
    const systemMessage = {
        role: "system",
        content: `
        Task: Based on the Objective, analyse the following message and decide the outcome for this objective based on the Rules of evaluation.
        The only possible outcomes are "passed", "failed", "warning", and "inapplicable".

        Objective: ${currentObjective.objective}

        *** Rules of Evaluation:
        ${currentObjective.test?.conditions?.pass ? `passed: "${currentObjective.test.conditions.pass}"\n` : ""}
        ${currentObjective.test?.conditions?.warn ? `warning: "${currentObjective.test.conditions.warn}"\n` : ""}
        ${currentObjective.test?.conditions?.fail ? `failed: "${currentObjective.test.conditions.fail}"\n` : ""}
        ${currentObjective.test?.conditions?.inapplicable ? `inapplicable: "${currentObjective.test.conditions.inapplicable}"\n` : ""}
        ***

        Instructions:
        - Return ONLY a valid JSON object. Example: {"outcome": "passed"}
        - Allowed values for "outcome": "passed", "failed", "warning", "inapplicable"
        - No additional text, explanation, or comments.
        `
    };

    const result = await LLM.invoke([systemMessage, humanMessage]);
    let outcomeResult: TestOutcome = "inapplicable";
    try {
        const parsed = JSON.parse(result.content as string);
        outcomeResult = parsed.outcome;
    } catch  {
        // fallback se o modelo não devolver JSON válido
        const content = String(result.content).toLowerCase();
        if (content.includes("passed")) {
            outcomeResult = "passed";
        } else if (content.includes("failed")) {
            outcomeResult = "failed";
        } else if (content.includes("warning")) {
            outcomeResult = "warning";
        } else {
            outcomeResult = "inapplicable";
        }
    }
        const finalOutputEvaluation: FinalOutput = {
        response: "",
        status: "running",
        lastMesssagePassedCheck: {
            code: currentObjective.test!.code,
            selector: currentObjective.test!.selector,
            outcome: outcomeResult

        }
    }
    if(currentObjective.test?.code==="QW-CUI-C8"){
        if(outcomeResult === "passed"){
            // adicionar services to important context
            LLM.model = "gpt-4.1-nano";
            LLM.temperature = 0;

            const systemMessageServices = {
            role: "system",
            content:
                `Task: Extract key information from the given text, focusing on important topics or services mentioned.

        Instructions:
        - Identify all relevant services, topics, or key information mentioned in the text.
        - Organize the output as a clear, concise list or short summary.
        - Do NOT generate extra commentary, explanations, or unrelated content.
        - Keep output in language of ( ${Settings.locale}), plain text only.
        - Be concise and precise.`
            };

            
        const resultServices = await LLM.invoke([systemMessageServices, humanMessage]);
  

                return {finalOutput: finalOutputEvaluation, currentEvaluationObjective: null,importantContext: [resultServices.content]}
        }
    }

    return {finalOutput: finalOutputEvaluation, currentEvaluationObjective: null}

}
/**
 *
 * @param state
 * @returns
 */
export const objectiveAchiever = async (state: typeof GraphState.State) => {
    const objectives = state.objectives;
    const currentObjective = state.currentObjective;
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    // if CurrentObjective does not exist
    if (!currentObjective) return {status: "completed"};
    LLM.model = "gpt-4o";
    LLM.temperature = 0;
    
    // TODO: if last message is not from Human, assume chatbot did not answeer
    const humanMessage = lastMessage instanceof HumanMessage ? lastMessage
        : new HumanMessage({content: lastMessage.content ?? String(lastMessage)});


    const systemMessage = {
        role: "system",
        content:
            `Task: Based on the Objective, analyse the following message and decide if the Objective is achieved.
       Objective: ${currentObjective.objective}
        ${currentObjective?.requirements ? `Requirements: "${currentObjective.requirements}"\n` : ""}

       Instructions:
       - Return ONLY a valid JSON object.
       - Format: {"achieved": true} or {"achieved": false}
       - "achieved": true if the objective is achieved, false otherwise.
       - No aditional text or comments
        ${currentObjective?.requirements ? `- The achieved result must be determined according to the provided Requirements.` : ""}`
    };

    const result = await LLM.invoke([systemMessage, humanMessage]);

    // check result
    let achieved: boolean = false;
    try {
        const parsed = JSON.parse(result.content as string);
        achieved = !!parsed.achieved;
    } catch {
        // fallback se o modelo não devolver JSON válido
        achieved = String(result.content).toLowerCase().includes("true");
    }
    // updateObjetives
    const updatedObjectives: Record<string, Objective> = objectives;
    // get CurrentKey
    const currentObjectiveKey = Object.keys(updatedObjectives).find(
        (key) => updatedObjectives[key].objective === currentObjective.objective
    );

    // if Object was Achieved
    if (achieved) {
        let evaluationObjective: EvaluationTest | null = null;

        if (currentObjectiveKey) updatedObjectives[currentObjectiveKey].status.completed = true;
        // Objective achieved was a QW browser test??
        if (currentObjective.test) {
            evaluationObjective = {
                message: humanMessage,
                objective: currentObjective
            }
        }

        return {
            objectives: updatedObjectives,
            currentEvaluationObjective: evaluationObjective,
            currentObjectiveMessages: [],
            currentObjective: null,
            objectiveAchieved: currentObjectiveKey,
            status: "completed",
        };

    } else {

        updatedObjectives[currentObjectiveKey!].status.counter += 1;

        if(updatedObjectives[currentObjectiveKey!].status.counter >= 3){
            // Max attempts reached, mark as completed to avoid infinite loop
            updatedObjectives[currentObjectiveKey!].status.completed = true;
            return {
                objectives: updatedObjectives,
                currentObjectiveMessages: [],
                currentObjective: null,
                objectiveAchieved: null,
                status: "running",
            };
        }

        return {
            objectives: updatedObjectives,
            currentObjectiveMessages: humanMessage,
            currentObjective, // mantém o mesmo objetivo ativo
            objectiveAchieved: null,
            status: "running",
        };
    }
}
export const getNextObjective = async (state: typeof GraphState.State) => {
    // load next objective not completed
    const objectives = state.objectives;
    const nextObjective = Object.values(objectives).find(
    (objective): objective is Objective =>
        typeof objective === "object" &&
        objective !== null &&
        "status" in objective &&
        typeof objective.status === "object" &&
        objective.status !== null &&
        "completed" in objective.status &&
        !objective.status.completed
    );
    if (nextObjective) {
        return {currentObjective: nextObjective, status: "running"}
    } else {
        return {status: nextObjective ? "running" : "completed"};
    }


};
/**
 *
 * @param state
 * @returns
 */
export const agentReviewer = async (state: typeof GraphState.State) => {
    const {messages} = state;
    LLM.model = "gpt-4o";
    LLM.temperature = 0.5;
    LLM.topP = 0.5;
    LLM.frequencyPenalty = 0.7;
    LLM.presencePenalty = 0.6;
    

    const systemMessage = {
        role: "system",
        content: `
  You are a AI Agent that analyses messages of another assistant AI, based on last message you should make a strategy to pass to another agent for a question formulation.

  objective: "${state.currentObjective?.objective || ""}".
  Important context: ${state.importantContext.join(", ")}.

  Based on the messages in the conversation history, you should:
  - Questions should be indirect and based on the context of the conversation with the objective in mind.
  - Do not repeat strategies that were already used.
  - Acronyms and terms contained in Important Context should be used.
  - Analyze the context and information provided.
  - Avoid strategies about software actualizations or history of platforms or other security sensitive information. 
  - Dont provide possible questions just plane strategy for objective
`
    };
    const result = await LLM.invoke([systemMessage, ...messages]);
    return {messages: [result]};
};
export const strategyFormulator = async (state: typeof GraphState.State) => {
    const {currentObjectiveMessages, importantContext, currentObjective} = state;
    LLM.model = "gpt-4o-mini";
    LLM.temperature = 0;
    LLM.topP = 1;
    LLM.maxTokens = 100;
    LLM.n = 1;


const systemMessage = {
  role: "system",
  content: `Define a short strategy to achieve the Objective, considering that previous attempts failed.

Knowledge Base: ${importantContext.join(", ")}
Objective: ${currentObjective?.objective}
${currentObjective?.requirements ? `Requirements:
${currentObjective.requirements}
- Note: Requirements describe the type or characteristics of the answers that the questions you will generate should aim to elicit. They guide the focus of your strategy without providing the exact answers.\n` : ""}


Context:
- ***All previous assistant messages represent questions that failed.***
- ***All previous user messages represent answers that failed.***
- ***Analyze these past messages to learn why they failed, but do NOT copy their specific content. Create a general approach that guides future questions.***
- ***If questions failed multiple times choose the most relevant domain/topic to achieve the Objective from Knowledge Base.***


Instructions:
- Focus on the Knowledge Base${currentObjective?.requirements ? " and the Requirements" : ""}.
- Avoid repeating errors detected in past messages.
- ***Output a strategy as plain text, describing an approach to generate questions, not direct answers.***
-- Output only the strategy as plain text, maximum 2 lines (one line break allowed), no extra explanations.`
}
    const result = await LLM.invoke([systemMessage, ...currentObjectiveMessages]);
    //Revert options for LLM
    LLM.topP = undefined;
    LLM.maxTokens = undefined;
    LLM.n = undefined;

    return {strategy: result.content};
};
export const callQuestionFormulator = async (state: typeof GraphState.State) => {
    const {currentObjective, strategy,importantContext} = state;
    LLM.model = "gpt-4o-mini";
    LLM.temperature = 0.1;
    LLM.topP = 1;
    LLM.frequencyPenalty = 0.3;
    LLM.presencePenalty = 0.3;
    LLM.maxTokens = 150;
    LLM.n = 1;


const systemMessage = new SystemMessage(`
Task:
Using the provided Strategy, formulate a short and precise question that will help achieve the Objective. 
Apply the Strategy to the Knowledge Base when creating the question.

Strategy: ${strategy!}

Objective: ${currentObjective?.objective}
   ${currentObjective?.requirements ? `Requirements: "${currentObjective.requirements}"\n` : ""}
Knowledge Base: ${importantContext.join(", ")}

Instructions:
- Formulate a question that follows the Strategy exactly.
- The question should help gather necessary information to achieve the Objective.
- Make it very simple, clear, and specific.
- Do not add any extra information or context, just the question.
- Ensure the assistant can answer it directly.
- Write the question in  ${Settings.locale}.
- Keep the question concise and focused.
 ${currentObjective?.requirements ? `- The Requirements indicate the type of answer your question should elicit.` : ""}
`);
    const result = await LLM.invoke([systemMessage,]);
    //Revert options for LLM
    LLM.topP = undefined;
    LLM.frequencyPenalty = undefined;
    LLM.presencePenalty = undefined;
    LLM.maxTokens = undefined;
    LLM.n = undefined;

    return {currentObjectiveMessages: result, messages: [result], strategy: null};
};
export const askAssistantForMoreInfo = async (state: typeof GraphState.State, input: any) => {
    const {messages} = state;
    const strategy = input.strategy;
    LLM.model = "gpt-4o-mini";
    LLM.temperature = 0.5;
    LLM.topP = 0.5;
    LLM.frequencyPenalty = 0.7;
    LLM.presencePenalty = 0.6;
    const systemMessage = {
        role: "system",
        content:
            `Task: Based on the Strategy proposed and last messages, ask the assistant for more information about the services or help offered in relation to the entity to achieve the objective.
       Strategy: ${strategy}
       Objective: ${state.currentObjective?.objective || ""}
       Follow the instructions of Last message and make a short question for this in language Locale :  ${Settings.locale}.
      .`,
    };
    const result = await LLM.invoke([systemMessage, ...messages]);
      //Revert options for LLM
    LLM.topP = undefined;
    LLM.frequencyPenalty = undefined;
    LLM.presencePenalty = undefined;

    return {messages: [result]};
};
export const prepareOutputMessage = (state: typeof GraphState.State) => {
    const {messages, objectiveAchieved, finalOutput} = state;

    const lastMessage = messages[messages.length - 1];
    const finalOutputStructured = {
        response: lastMessage.text || null,
        lastMesssagePassedCheck: finalOutput?.lastMesssagePassedCheck ?? objectiveAchieved,
        status: state.status,
    } as FinalOutput;

    return {finalOutput: finalOutputStructured};

};

export const humanSkipInterrupt = (state: typeof GraphState.State) => {
    const {isSkipObjectivePressed} = state;
   if (!isSkipObjectivePressed) {
    throw new NodeInterrupt(``);
    } else {
        const {currentObjective,objectives} = state;
    
      
        const currentObjectiveKey = Object.keys(objectives).find(
        key => objectives[key].objective === currentObjective?.objective
        );
        console.log("Current Objetive Key",currentObjectiveKey);
        const updatedObjectives = {
            ...objectives,
            [currentObjectiveKey!]: {
                ...objectives[currentObjectiveKey!],
                status: {
                ...objectives[currentObjectiveKey!].status,
                completed: true,
                },
            },
            };
        
        return {currentObjectiveMessages:[],
                currentObjective:null,
                objectives: updatedObjectives,
                currentEvaluationObjective: null,
                isSkipObjectivePressed:false};
     }

}