//import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";



/*const webSearchTool = new TavilySearch({
  maxResults: 4,
});
*/
/*
const assistantServicesSearch = tool(
  async (input) => {
    const results = await webSearchTool.call({
      query: `${input.name} services`,
      maxResults: 4,
    });
    return { messages: [input, results] };
  },
  {
    name: "Search_Assistant_Services",
    description:
      "Searches for entity services and context related to a specific company.This tool should only be called if you know a entity name. The result is a JSON stringified object containing details such as: ticker symbol, company name, CIK number, market capitalization, number of employees, SIC code and description, website URL, listing date, and whether the company is currently active.",
    schema: z.object({
      name: z.string().describe("The name of entity to search for")
    }),

  }
);
*/
const askAssistantForInformation = tool(
  async (input) => {
      return input.strategy;
  },
  {
    name: "Ask_Assistant_Context",
    description:
      "Ask assistant for information about services or help offered.",
    schema: z.object({
      strategy: z.string().describe("Strategy to use to adquire the information about the help or services offered by the entity chatbot, based on the knowledge already acquired."),
    }),
  }
);






export const ALL_TOOLS_LIST =[askAssistantForInformation]