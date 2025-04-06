import { PromptTemplate } from "@langchain/core/prompts";
import { confidenceLevelEvaluatorWithExamples, promptGetQuestion, promptGetQuestionWithExamples } from "./prompts/interactionPrompt";



interface ObjectivePrompts{
    objective: string;
    TestIdentifier?: string;
    promptTemplate: PromptTemplate;
    promptEvaluator: PromptTemplate;
    summaryEvaluator?:boolean;
    exampleQuestion?: string;
    exampleSuccess?: string;
}

export interface ObjectiveDirectives{
  objective:string;
  promptQuestion: PromptTemplate;
  promptEvaluator: PromptTemplate;
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
  
  let promptQuestion = await objective.promptTemplate.partial({objective:objective.objective});
  let promptEvaluator = await objective.promptEvaluator.partial({objective:objective.objective});
  if(objective.exampleQuestion){
    promptQuestion = await promptQuestion.partial({examples:objective.exampleQuestion});
  }
  if(objective.exampleSuccess){
    promptEvaluator = await promptEvaluator.partial({examples:objective.exampleSuccess});
  }
  return {objective:objective.objective,promptQuestion:promptQuestion,promptEvaluator:promptEvaluator};
}

export const OBJECTIVES: ObjectivePrompts[] = [
  /*
  {
    objective: `Identify the are of domain of chatbot and who it represents.`,
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

    `
  },*/
  {
    objective: `Obtain any type of date format from a response.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What time does your service start?
    What is the date of the event?
    When is the deadline for the task?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "2022-12-31 at 10:00 AM."
    The chatbot response contains: "December 31st at 10:00 AM."
    The chatbot response contains: "31/12/2022 at 10:00 AM."
    The chatbot response contains: "last day of the year at 10:00 AM."

    Any response that includes a date in any recognizable format is considered successful.
    `
  },
  {
    objective: `Obtain the currency format used by the chatbot.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What is the price of the item?
    How much does it cost?
    What is the total amount?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language and currency of the chatbot Locale:
    The chatbot response contains: "$100.00"
    The chatbot response contains: "€85,50"
    The chatbot response contains: "£75.00"

    Any response that includes a currency symbol, code, or format is considered successful
    `
  },
  {
    objective: `Obtain the percentage format used by the chatbot, including how it handles values (e.g., decimal places, symbols, or text).`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What is the success rate?
    What percentage of users are satisfied?
    How much did the value increase?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "75%"
    The chatbot response contains: "85.5 percent"
    The chatbot response contains: "90%"
    `
  },
  {
    objective: `Obtain the URL or link format accepted by the chatbot, including whether it accepts full URLs, short links, or specific domain rules.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    Can you provide a link?
    What is the URL for the website?
    How can I access the page?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "https://www.example.com"
    The chatbot response contains: "http://example.com"
    The chatbot response contains: "www.example.com"
    `
  },
  {
    objective: `Obtain the format for durations or time intervals used by the chatbot, including units like seconds, minutes, hours, and days.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    How long does the process take?
    What is the duration of the event?
    How many hours will it take to complete?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "2 hours."
    The chatbot response contains: "30 minutes."
    The chatbot response contains: "15 seconds."
    `
  },
  {
    objective: `Obtain the time zone information used by the chatbot, including the time zone name, abbreviation, and offset from UTC.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What is your time zone?
    What time zone are you in?
    What is the current time zone?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "Eastern Standard Time (EST)"
    The chatbot response contains: "UTC+5"
    The chatbot response contains: "Pacific Daylight Time (PDT)"
    `
  },
  
  {
    objective: `Obtain the phone number format used by the chatbot, including any country codes, separators, or conventions based on region.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What is your phone number?
    How can I contact you by phone?
    What is the customer service number?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "+1-800-555-1234"
    The chatbot response contains: "(123) 456-7890"
    The chatbot response contains: "123-456-7890"
    `
  },
  {
    objective: `Obtain the types of payment methods supported by the chatbot, including card details, digital wallets, and cryptocurrency options.`,
    promptTemplate: promptGetQuestionWithExamples,
    promptEvaluator: confidenceLevelEvaluatorWithExamples,
    exampleQuestion: `
    What payment methods do you accept?
    Can I pay with a credit card?
    Do you support digital wallets?
    `,
    exampleSuccess: `
    You should expect variations of the following types of responses in the language of the chatbot:
    The chatbot response contains: "We accept Visa, MasterCard, and American Express."
    The chatbot response contains: "You can pay with PayPal or Apple Pay."
    The chatbot response contains: "We support Bitcoin and Ethereum."
    `
  }
];



 