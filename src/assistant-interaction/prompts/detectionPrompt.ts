import { PromptTemplate } from '@langchain/core/prompts';

/**Prompt for Detection of elements in HTML
 *
 * {formatInstructions} is the format of the output
 */

export const detectionCorrection = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selectors:
    
    1. The main parent window that contains the chatbot interface.
    2. The input element for text to send a message to the chatbot. This could be a \`textarea\`, an \`input\` with \`type="text"\`, or a \`div\` with \`contenteditable="true"\`.
    3. The chat conversation window that contains messages from both the chatbot and the user.
    4. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    5. The microphone button (if present) that activates microphone input for the prompt.
    
    Additional information:
    {information}
  

    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Ensure the CSS selectors are optimized, concise, and focus on the most unique attributes of each element (e.g., \`id\`, \`class\`, \`data-*\`).
    - Avoid relying on brittle identifiers or unnecessary complex hierarchy.
    - If multiple matches exist, choose the selector that is most specific to the task.
 
    Priority Rules for Selectors:
    1. Custom tags or other unique identifiers (such as \`data-*\` attributes, \`id\`, or other specific attributes).
    2. More generic identifiers like \`class\`, \`name\`, or other attributes.
       2.1 When working with attributes that can contain multiple values, always use:
           \`div[class*='className']\` or \`div[data-*='value']\` for better matching.
    
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    Ensure that the selectors are relative and utilize custom attributes, classes, or data-attributes where appropriate to avoid reliance on brittle paths.
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);

export const detectionPrompt = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selectors:
    
    1. The main parent window that contains the chatbot interface.
    2. The input element for text to send a message to the chatbot. This could be a \`textarea\`, an \`input\` with \`type="text"\`, or a \`div\` with \`contenteditable="true"\`.
    3. The chat conversation window that contains messages from both the chatbot and the user.
    4. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    5. The microphone button (if present) that activates microphone input for the prompt.
    
    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Ensure the CSS selectors are optimized, concise, and focus on the most unique attributes of each element (e.g., \`id\`, \`class\`, \`data-*\`).
    - Avoid relying on brittle identifiers or unnecessary complex hierarchy.
    - If multiple matches exist, choose the selector that is most specific to the task.
 
    Priority Rules for Selectors:
    1. Custom tags or other unique identifiers (such as \`data-*\` attributes, \`id\`, or other specific attributes).
    2. More generic identifiers like \`class\`, \`name\`, or other attributes.
       2.1 When working with attributes that can contain multiple values, always use:
           \`div[class*='className']\` or \`div[data-*='value']\` for better matching.
    
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    Ensure that the selectors are relative and utilize custom attributes, classes, or data-attributes where appropriate to avoid reliance on brittle paths.
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);

export const detectionPromptTestB = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selectors:
    
    1. The main parent window that contains the chatbot interface.
    2. The input element for text to send a message to the chatbot. This could be a \`textarea\`, an \`input\` with \`type="text"\`, or a \`div\` with \`contenteditable="true"\`.
    3. The chat conversation window that contains messages from both the chatbot and the user.
    4. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    5. The microphone button (if present) that activates microphone input for the prompt.
    
    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Ensure the CSS selectors are optimized, concise, and focus on the most unique attributes of each element (e.g., \`id\`, \`class\`, \`data-*\`).
    - Avoid relying on brittle identifiers or unnecessary complex hierarchy.
    - If multiple matches exist, choose the selector that is most specific to the task.
    
    Priority Rules for Selectors:
    1. Custom tags or other unique identifiers (such as \`data-*\` attributes, \`id\`, or other specific attributes).
    2. More generic identifiers like \`class\`, \`name\`, or other attributes.
       2.1 When working with attributes that can contain multiple values, always use:
           \`div[class*='className']\` or \`div[data-*='value']\` for better matching.
    
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    Ensure that the selectors are relative and utilize custom attributes, classes, or data-attributes where appropriate to avoid reliance on brittle paths.
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);

export const detectionPromptReducedtest = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selector:
    1. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    2. The microphone button (if present) that activates microphone input for the prompt and permits dictate.
    
    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Ensure the CSS selectors are optimized, concise, and focus on the most unique attributes of each element (e.g., \`id\`, \`class\`, \`data-*\`).
    - Avoid relying on brittle identifiers or unnecessary complex hierarchy.
    - If multiple matches exist, choose the selector that is most specific to the task.
    - Return valid CSS selector respecting syntax for type of selector choosen.
    - Custom tag selector should be custom tag name, not a class.
    - If class dont use bootstrap or other common classes, use custom classes.
    - Never use class that contains CSS functions or variables.
    
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
        
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);
export const detectionPromptReduced = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selector:
    1. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    2. The microphone button (if present) that activates microphone input for the prompt.
    
    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Never use a class that contains CSS functions or variables.
 
    Priority Rules for Selectors:
    1. Custom tags or other unique identifiers (such as \`data-*\` attributes, \`id\`, or other specific attributes).
    2. More generic identifiers like \`class\`, \`name\`, or other attributes.
     
  
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);
export const detectionPromptReducedBackup = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE CSS selector:
    1. The selector for elements that represent messages from the chatbot, excluding reliance on \`textContent\`.
    2. The microphone button (if present) that activates microphone input for the prompt.
    
    If any element is not found, return "null" for that element.
    
    Important Notes:
    - Only provide RELATIVE CSS selectors (not absolute).
    - Pay attention to custom tags, custom attributes, and data-attributes (e.g., \`data-*\`) as they can help identify elements more uniquely.
    - Ensure the CSS selectors are optimized, concise, and focus on the most unique attributes of each element (e.g., \`id\`, \`class\`, \`data-*\`).
    - Avoid relying on brittle identifiers or unnecessary complex hierarchy.
    - If multiple matches exist, choose the selector that is most specific to the task.
 
    Priority Rules for Selectors:
    1. Custom tags or other unique identifiers (such as \`data-*\` attributes, \`id\`, or other specific attributes).
    2. More generic identifiers like \`class\`, \`name\`, or other attributes.
       2.1 When working with attributes that can contain multiple values, always use:
           \`div[class*='className']\` or \`div[data-*='value']\` for better matching.
    
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    Ensure that the selectors are relative and utilize custom attributes, classes, or data-attributes where appropriate to avoid reliance on brittle paths.
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);

export const detectionPromptReducedbackup = PromptTemplate.fromTemplate(`
Task:
From a given HTML that represents the main section of messages between a user and a chatbot, find:

Selector for chatbot messages (do not use textContent).

Selector for the microphone button (if it exists).

Instructions:

Use relative CSS selectors only (no absolute paths).
Do not use type .class selectors.
Use partial match selectors

If an element is not found, return "null".
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);
export const detectionPromptReducednew = PromptTemplate.fromTemplate(`
Task:
From a given HTML that represents the main section of messages between a user and a chatbot, find:

Selector for chatbot messages.

Selector for the microphone button (if it exists).

Instructions:

Use simple CSS selectors based on unique features that identify the element (no absolute paths).
Do not use type .class selectors.
Use Attribute Selectors unless the element is a custom tag, choose unique values for the selectors.

If an element is not found, return "null".
    With no extra comments or text, provide the following elements in JSON format:
    
    {formatInstructions}
    
    
    Now proceed with identifying the elements in the given HTML structure:
    {input}
    
      `);
