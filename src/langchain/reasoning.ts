import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { invokeDirectMessageOllama, InvokeModelWithMemory, invokeModelWithoutMemoryOllama } from "./langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

interface IQuestion {
  question: string|null;
  options: string|null;
}
      const GoalPromptQuestion = PromptTemplate.fromTemplate(`
         You are an AI agent that interacts with another chatbot. Your role is to ask one concise question at a time to determine the objective:

        The objective of your question is:
      
        {objective}

        Task:
        Ask a question to achieve objective based on the knowledge you have of the chatbot, you should not repeat question based on history of chat.


        Guidelines:
        Reason with chat history and ask questions that will help you achieve the objective.
        Ask only one short, clear question at a time.
        Focus on the most relevant question based on the assistant's previous response.
        If needed, reformulate or move to a different question without repeating previous ones.
        No extra information or comments should be included in the question.
        Ask in the same language the assistant is using.
`);

export async function askQuestion(objective:string): Promise<ConversationChain> {
    
    let contextFormat = await GoalPromptQuestion.format({objective: "Obtain AI Assistant domain, services, and context."});
    const chain:ConversationChain = await InvokeModelWithMemory("llama3.1", contextFormat, 0.3);  
    const outputParser = new StringOutputParser();

    // Pipe the conversation into the output parser
    return chain;
}

function dateQuestion(): string {
    


    return " ";
  
}

export async function reasonQuestions(html:string): Promise<string> {
    let context = `You are an HTML reasoning chatbot. Based on a portion of a chatbot's answer, you will determine whether it is a normal response or a button query for mouse input. 
Your output must be **strictly** in JSON format with no additional text, comments, or explanations.

JSON SCHEMA:
{
    "question": "question text available in html that describes the options",
    "options": ["option 1", "option 2", "option 3", "option 4"]
  
} 
If it is a normal text answer, output:
{
    "question": null,
    "options": null
}`;
    const parser = new JsonOutputParser<IQuestion>();
   const model  =await  invokeModelWithoutMemoryOllama("mistral:7b-instruct",context,html ,0);

  
    return " ";
  } 

  