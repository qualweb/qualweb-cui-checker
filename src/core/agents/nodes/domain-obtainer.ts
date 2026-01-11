import { GraphState } from '../state';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { LLM, Settings } from '../langgraph-orchestrator';
import { STATUS_GRAPH } from '../domain/types';
import InputRegistry from '../domain/GraphInput/InputRegistry';
import GraphInitialInput from '../domain/GraphInput/GraphInitialInput';
import { extractText } from '../util';
import { DomainObtainerError, InvalidGraphInitialInputError } from '../Errors';

export type TypeChatbot = 'rule-based' | 'intent-based' | 'task-oriented' | 'llm' | 'llm-agent';

/** Node responsible to obtain the domain of the current assistant.
 *  This node will only run in first message from assistant
 *
 * @param state
 * @returns
 */
export const domain_obtainer = async (state: typeof GraphState.State) => {
  const { graphInput } = state;
  const graphInitialInput = InputRegistry.deserialize(graphInput);

  if (!(graphInitialInput instanceof GraphInitialInput)) {
    throw new InvalidGraphInitialInputError('Invalid graph initial input provided');
  }
  // Configure LLM
  LLM.model = 'gpt-4o';
  LLM.temperature = 0;
  // Set up parser and prompt
  const parser = generateParser();
  const formatInstructions = parser.getFormatInstructions();
  const systemMessage = generatePrompt(graphInitialInput, formatInstructions);

  // Retry mechanism
  const MAX_RETRIES = 2;
  let resultContent: any = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await LLM.invoke([systemMessage]);

      const content = extractText(result.content);

      resultContent = await parser.parse(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn(`domain_obtainer: Attempt ${attempt + 1} failed.`);
        if (attempt === MAX_RETRIES)
          throw new DomainObtainerError('Max retries reached in domain obtainer');
        systemMessage.content += `
        Note: Previous response was invalid. Please ensure the output strictly follows the specified format.`;
        continue; // retry
      }
      throw error;
    }

    break;
  }

  // Extract Fields
  const context = extractDomainContext(resultContent);

  const finalOutput = {
    status: STATUS_GRAPH.IN_PROGRESS,
    actions: [],
  };
  return {
    isFirstMessage: false,
    importantContext: [context],
    objectiveAchieved: null,
    graphOutput: finalOutput,
    status: STATUS_GRAPH.IN_PROGRESS,
  };
};

const rules: Record<TypeChatbot, string> = {
  'rule-based':
    'Operates on predefined rules and scripted flows, often keyword or pattern matching.',
  'intent-based':
    'Uses NLP to detect user intents and respond accordingly but usually without deep context management.',
  'task-oriented':
    'Maintains conversation context and completes multi-turn tasks with slot filling.',
  llm: 'Powered by large language models to generate free-form, open-domain natural language responses.',
  'llm-agent':
    'Combines LLM with external tools or APIs to perform complex actions beyond text generation.',
};

function extractDomainContext(resultContent: any) {
  const entityName = resultContent['entity'] || null;

  const shortDescription = resultContent['description'] || null;

  const servicesOffers = Array.isArray(resultContent['services'])
    ? resultContent['services'].join('\n')
    : resultContent['services'] || null;

  const typeChatbotKey = resultContent['type_chatbot'] as TypeChatbot | null;

  const typeChatbotDescription = typeChatbotKey ? rules[typeChatbotKey] : null;

  const context = `Entity: ${entityName}, Description: ${shortDescription}, Services: ${servicesOffers}
   Chatbot Type: ${typeChatbotKey} - ${typeChatbotDescription} `;
  return context;
}

function generateParser() {
  const OutputSchema = z.object({
    entity: z.string().nullable(),
    description: z.string().nullable(),
    services: z.array(z.string()).nullable(),
    type_chatbot: z.enum(['rule-based', 'intent-based', 'task-oriented', 'llm', 'llm-agent']),
  });

  return StructuredOutputParser.fromZodSchema(OutputSchema);
}
function generatePrompt(graphInput: GraphInitialInput, formatInstructions: string) {
  return {
    role: 'system',
    content: `You will receive a URL and a message from an assistant AI. Your task is to extract and provide the following information:
    URL: ${graphInput.getUrl()}
    Message: ${graphInput.getMessage()}

    - Entity Name: the main name of the entity on the website.
    - Short Description: a very short description (1-2 sentences) of the entity, in the language of the website.
    - Services/Offers: List ONLY user-facing chatbot services or assistance topics that can be tested for accessibility through conversational interaction.
      Do NOT include backend automation, integrations, developer tools, or abstract capabilities that cannot be directly verified through chatbot responses.
    
    - Chatbot Type: Identify the type of chatbot used by the assistant from the following options, with these definitions:

      1. rule-based: Operates on predefined rules and scripted flows, often keyword or pattern matching.
      2. intent-based: Uses NLP to detect user intents and respond accordingly but usually without deep context management.
      3. task-oriented: Maintains conversation context and completes multi-turn tasks with slot filling.
      4. llm: Powered by large language models to generate free-form, open-domain natural language responses.
      5. llm-agent: Combines LLM with external tools or APIs to perform complex actions beyond text generation.

    Rules:
    - The description and list of services must be in Locale: ${Settings.locale}.
    - Include acronyms and technical terms exactly as on the site.
    - If any information is not available, use null.
    - Be concise and clear.
    - This description should come from your knowledge and not from web search.

    Output:
    ${formatInstructions}`,
  };
}
