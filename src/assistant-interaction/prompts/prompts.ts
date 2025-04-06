import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";


type dateArgs = {
    name: string;
    date: string;
  };


  /**Prompt for Detection of elements in HTML
   * 
   */

  
export const testDetectionPrompt = PromptTemplate.fromTemplate(`
  Task: Analyze the given HTML structure and identify the following elements using RELATIVE XPath:


1. The input element for text to send a message to the chatbot. It should be one of the following:
    <textarea>
    <input type="text">
    <div contenteditable="true">
2. The chat conversation window that contains messages from both the chatbot and the user.
3. The XPath for main indivisable element that represents a chatbot message.
4. The microphone button that activates microphone input for the prompt.
5. The main parent window that contains all the elements mentioned above.

If any element is not found, return "null" for that element.

Important Notes:

Provide only RELATIVE XPath (not absolute).
Pay attention to custom tags, custom attributes, and data- attributes*, as they may help you construct the XPath.
Ensure that the XPath is optimized and avoids relying on brittle identifiers or unnecessary hierarchy levels.
In case of multiple potential matches, choose the one that is most specific to the task.
Priority Rules for XPath:

Prefer custom tags or unique identifiers.
If no custom tag or unique identifier is found, use more generic attributes like class or other attributes.
With no extra comments or text, provide the following elements in JSON format:

  {formatInstructions}

`);

export const detectionPrompt = PromptTemplate.fromTemplate(`
    Task: Analyze the given HTML structure and identify the following elements using RELATIVE XPath:
1. The main parent window that contain items asked.
2. The input element for text to send message to chatbot should be textarea or input type=text or div contenteditable="true".
3. The Chat Conversation window that contain messages from chatbot and user.
4. The xpath for elements for the messages to the the user from bot, should be generic and not rely on textContent.
5. The microphone button, if present, that activates microphone input for the prompt.

If any element is not found, return "null" for that element.

Important Notes:
Only provide RELATIVE XPath (not absolute).
Pay attention to custom tags, custom attributes, and data-* as they can help you with this task.
Ensure the XPath is optimized and does not rely on brittle identifiers or unnecessary levels in the hierarchy.
If there are multiple potential matches, choose the one that is most specific to the task.
Priority Rules for  xpath:
  1. Custom tag or other unique identifier 
  2. More generic like class, or other atributes.
    2.1 when properties for attributes that can contain multiple values allways use the following method: contains(concat(' ', normalize-space(@class), ' '), '%space% className %space%') where %space% is a empty space ' ' .
  
  With no extra comments or text, provide the following elements in JSON format:
    {formatInstructions}

  `);


export const promptGetServices = PromptTemplate.fromTemplate(`
    You are an evaluator of chatbots. Your task is to ask one question at a time to determine the services provided by a given chatbot based on its input message.
    If the chatbot's domain is unclear, first ask about its services to establish context before generating further questions. If no suitable question can be formulated, respond with a polite compliment and express gratitude.
    Instructions:
    Based on chathistory, generate a relevant question that aligns with the services the chatbot provides.
    
    The output must strictly follow the expected format, with no additional text, comments, or explanations.
    The output language must match the language of the chatbot's first messages.
    First Messages of the Chatbot: {message}
    `);
    
export const promptHasServices = PromptTemplate.fromTemplate(`
      You are an evaluator of chatbots. Your task is to determine whether a chatbot explicitly states the services it provides in its response.
    
    Instructions:
    
    Analyze the chatbot's response and check if it clearly mentions the services it offers.
    The output must be strictly formatted as either "Yes" (if the chatbot states its services) or "No" (if it does not).
    No additional text, comments, or explanations should be included.
    Chatbot Response: {response}
      `);
    
export const promptExtractServices= PromptTemplate.fromTemplate(`
    You are a chatbot evaluator. Your task is to determine whether a chatbot explicitly states the services it provides in its response.
    
    Instructions:
    Analyze the chatbot's response to check if it clearly mentions its services or domains.
    If services or domains are mentioned, summarize them concisely to add to our context.
    If no services are mentioned, do not respond.
    Provide only the summary—no additional text, comments, or explanations.
    Chatbot Response: {response}
        `);

// obtain services from chatbot
export const prompt1 = PromptTemplate.fromTemplate(`
Your are a e`);

// based on the services provided, call the next prompt based on the area of expertise


// Choose the most appropriate option from the ones presented by the chatbot
export const optionChoose = PromptTemplate.fromTemplate(`
    You are a decision-maker tasked with selecting the most appropriate option from the ones presented by the chatbot. The options are provided in response to a user's query, and your goal is to choose the option that best helps the user achieve their objective.
    
    Previous User Message: {message}
    Options Offered by Chatbot: {options}
    User's Objective: {objective}
    
    Based on the user's question and their objective, determine which option will best help them achieve their goal.
    Answer only with the option that you believe is most appropriate with no comments or additional text.
      `);

export const prompDetectTypeMessage = PromptTemplate.fromTemplate(`
        You are HTML. You will receive HTML code from a chatbot's response. Based on the content, determine the type of the answer in one word from the following valid options: ["message", "options", "interface"].
        
        - "message": Standard HTML with text from the chatbot.
        - "options": HTML code with selectable options or buttons. ( Have in mind that the options are not always buttons as a element can be associated with javascript to so analyse context and previous messages)
        - "interface": HTML code containing the chatbot interface, including input options.
        
        Your task is to identify which category the provided HTML belongs to. Your output must be **strictly** in JSON format with no additional text, comments, or explanations.
        
        Previous Message: 
        {previousMessage}
        
        HTML:
        {code}
        
        `);
  export const promptExtractOptions = PromptTemplate.fromTemplate(`
        You are an HTML reasoning chatbot. Based on a portion of a chatbot's answer, you will determine whether it is a normal response or a button query for mouse input. 
        Your output must be **strictly** in JSON format with no additional text, comments, or explanations.
        
        JSON SCHEMA:
            "question": "question text available in html that describes the options",
            "options": ["option 1", "option 2", "option 3", "option 4"]
        
        If it is a normal text answer, output:
            "question": null,
            "options": null
        
            HTML:
            {code}

            Return a JSON response:
            {formatInstructions}
            
        `);
        
export const promptChooseOption = PromptTemplate.fromTemplate(`
       Task:
       Analyse Previous User Message, and Question asked by chatbot and select one item of the array of item options that best aligns with the user's objective.
      
Previous User Message: {message}
Question asked by Chatbot: {question}
Array of item options: [ {options} ]
User's Objective: {objective}

Guidelines:
Choose the item option that best aligns with the user's objective.
Select the item that is most likely to help the user achieve their goal.
Provide only the option you believe is most appropriate with no comments or additional text.
          `);
        
        let prompt3 = PromptTemplate.fromTemplate(`
        You are an HTML expert. Based on the provided partial HTML code, calculate the **direct relative XPath**  for the element that contains the text provided. 
        
        Element that contains text: {element}
        
        HTML Code: {code}
        
        Expected Output: Provide the **direct relative XPath**  for the element in the following **JSON format**:
        
          "xpath": "relative_xpath"
        
        Important Notes:
        Only provide RELATIVE XPath (not absolute).
        Ensure the XPath is optimized and does not rely on brittle identifiers or unnecessary levels in the hierarchy.
        If there are multiple potential matches, choose the one that is most specific to the task.
        NO COMMENTS OR ADDITIONAL TEXT ALLOWED.
        `);
export const initialContextPrompt = PromptTemplate.fromTemplate(`You are an accessibility information retriever. Your goal is to formulate a single, concise question at a time that a user might ask the chatbot to indirectly obtain date-related information while respecting the chatbot’s service constraints and security policies.  

Task: Based on the chatbot’s responses, generate a relevant question that aligns with the services it provides, ensuring it does not compromise security or request private information.  

- If the received message is empty , ask the chatbot what services it offers to establish context.  
- If the chatbot’s domain is unclear, prioritize clarifying its purpose before generating further questions.  
- If no suitable question can be formulated, respond with a polite compliment and express gratitude.
- Only talk in language received from the chatbot.`);
    
