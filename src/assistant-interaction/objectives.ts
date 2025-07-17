import { PromptTemplate } from "@langchain/core/prompts";
import { confidenceLevelEvaluatorWithExamples,  promptGetQuestionWithExamples } from "./prompts/interactionPrompt";



export interface ObjectiveSchema{
    objective: Objective;
    objectiveDescription: string;
    cui_checks: string[];
    data_attribute: string;
    promptTemplate: PromptTemplate;
    promptEvaluator: PromptTemplate;
    summaryEvaluator?:boolean;
    exampleQuestion?: string;
    exampleSuccess?: string;
}
export type Objective = "domain"|"date" | "currency" | "percentage" | "url" | "duration" | "timezone" | "phone" | "payment";

export interface ObjectivesMap{
    [key: string]: ObjectiveSchema;
}


export interface ObjectiveDirectives{
  objective:string;
  promptQuestion: PromptTemplate;
  promptEvaluator: PromptTemplate;
}

export function getAllObjectives():ObjectivesMap{
  let objectiveRecords:ObjectivesMap = {};
  // return all objectives that are in the list
  for( let obj of OBJECTIVES){
    objectiveRecords[obj.objective]=obj;
  }
  return objectiveRecords;
  
}

export function getObjectives(objectives:[Objective]):ObjectivesMap{
  // return all objectives that are in the list
  let objectivesToLoad =  OBJECTIVES.filter((objective) => objectives.includes(objective.objective));
  let objectiveRecords:ObjectivesMap = {};
  for( let obj of objectivesToLoad){
    objectiveRecords[obj.objective]=obj;
  }
  return objectiveRecords;
}


export async function getObjectiveDirectivesByKey(objective:Objective,ObjectivesActive:ObjectivesMap):Promise<ObjectiveDirectives>{
  // return prompt for evaluation and prompt for generation of question
  console.log("Objective", objective);
  console.log("Objectives Active", ObjectivesActive);
  let objectiveLoad = ObjectivesActive[objective];
  let objectiveDescription = objectiveLoad.objectiveDescription;
  
  let promptQuestion = await objectiveLoad.promptTemplate.partial({objective:objectiveDescription});
  let promptEvaluator = await objectiveLoad.promptEvaluator.partial({objective:objectiveDescription});
  if(objectiveLoad.exampleQuestion){
    promptQuestion = await promptQuestion.partial({examples:objectiveLoad.exampleQuestion});
  }
  if(objectiveLoad.exampleSuccess){
    promptEvaluator = await promptEvaluator.partial({examples:objectiveLoad.exampleSuccess});
  }
  return {objective:objectiveDescription,promptQuestion:promptQuestion,promptEvaluator:promptEvaluator};
}


/** Get the prompt for the objective
 * 
 * 
 * 
 * @param index index of the objective
 * @returns 
 */
export async function getObjectiveDirectives(index:number):Promise<ObjectiveDirectives>{
  // return prompt for evaluation and prompt for generation of question
  let objective = OBJECTIVES[index];
  
  let promptQuestion = await objective.promptTemplate.partial({objective:objective.objectiveDescription});
  let promptEvaluator = await objective.promptEvaluator.partial({objective:objective.objectiveDescription});
  if(objective.exampleQuestion){
    promptQuestion = await promptQuestion.partial({examples:objective.exampleQuestion});
  }
  if(objective.exampleSuccess){
    promptEvaluator = await promptEvaluator.partial({examples:objective.exampleSuccess});
  }
  return {objective:objective.objectiveDescription,promptQuestion:promptQuestion,promptEvaluator:promptEvaluator};
}


export const OBJECTIVES: ObjectiveSchema[] = [
  /*
  
  {
    objective: `domain`,
    objectiveDescription: `Obtain a response that clearly defines the chatbot's domain, purpose, and company affiliation. The chatbot should explicitly state its role, services, or the company it represents.`,
    cui_checks: ["QW-CUI-C1"],
    data_attribute: "domain",
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    Example variations of type of questions to ask the chatbot (Should ask a variation at a time):
    - What is your purpose?
    - What services do you offer?
    - What can you help me with?
    - Who owns or operates you?
    - Are you affiliated with any company or organization?
    - What kind of assistance do you provide?

    Can also be a good tatic to ask the chatbot what is its name or who he is or the name of the company that it represents.
    `,
    summaryEvaluator:true,
    exampleSuccess: `
  Expected variations of chatbot responses that clearly define its domain, purpose, and company affiliation:
    
    - "I am a chatbot that provides information about weather forecasts."
    - "I am a virtual assistant developed by XYZ Corp to help with scheduling appointments."
    - "I am a customer support bot for ABC Online Store, assisting users with orders and refunds."
    - "I am an AI assistant designed to provide technical support for software products."
    
    Any response that explicitly states the chatbot's role, services, or the company it represents is considered successful.
  -**Memory Context**: Contains that there will be events in the next week.
      -**Question**: Can you tell me when the event is?

      -**Memory Context**: Contains that there is a serviced offered
      -**Question**: When does your service start?

      -**Memory Context**: Contains that there is a task to be done
      -**Question**: When is the deadline for the task?

      -**Memory Context**: Contains that there is an event
      -**Question**: What is the date of the event?

      -**Memory Context**: Contains that there are events
      -**Question**: What next events do you have?

      -**Memory Context**: you can understand there is a service offered
      -**Question**: Till when can i use your service?

      `,
    `
  },*/
{
  objective: "date",
  objectiveDescription: `Obtain a response that includes a valid and explicit date, including at least one recognizable date component such as a specific day, month, and/or year.
   The response should not contain vague references like "three days", "in a month", or "next week".
   **Evidence is null if confidence is less than 70**`,
  promptTemplate: promptGetQuestionWithExamples,
  promptEvaluator: confidenceLevelEvaluatorWithExamples,
  cui_checks: ["QW-CUI-C3"],
  data_attribute: "date",
  exampleQuestion: `
  
  -**Memory Context**: Contains that there is a serviced offered
  -**Question**: What is the date I can apply to this service?

  -**Memory Context**: Contains that there is a task to be done
  -**Question**: When is the date to do this task?

  -**Memory Context**: Memory suggests there may be an event
  -**Question**: What is the date of the event?

  -**Memory Context**: You can understand there is a service offered
  -**Question**: What date is this service?
  `,
  exampleSuccess: `
  Input: "The event is on December 25th, 2023."
Output: {{"evidence": "December 25th, 2023", "confidence": 100}}

Input: "I'll be there next Friday."
Output: {{"evidence": "next Friday", "confidence": 50}}

Input: "The workshop runs from July 10 to July 15, 2023."
Output: {{"evidence": "July 10 to July 15, 2023", "confidence": 100}}

Input: "The conference is in April."
Output: {{"evidence": "April", "confidence": 70}}

Input: "I don't know."
Output: {{"evidence": null, "confidence": 0}}
  `
},
];



 