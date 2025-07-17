import { PromptTemplate } from "@langchain/core/prompts";



    
export const prompAnalyseFirstMessage = PromptTemplate.fromTemplate(`
  Given a certain initial message of a AI assistant, you will  analyze it and identify its main domain which it belongs to, generate a description concise based on the information present at the message.   
    Guidelines:
  - If there is an explicit or implicit domain, include it in the description.
  - If there is no explicit or implicit domain, should explicit that domain was not found.
  - If the message contains services, or relevant information about the domain, include them. 
  -Ignore any irrelevant information, such as privacy policies, terms of use, or general notices.
  -The output should be exclusively based on the input provided, without introducing new data not mentioned.  
  - No comments or additional text allowed.
  - Output should be in language of the input.
    Example 1:
  Input:
    "Olá, sou a assistente virtual da AT. O meu nome é cATia e sou a assistente virtual da AT, Autoridade Tributária e Aduaneira. Em que posso ajudar?"
  Expected output :
   "Autoridade Tributária e Aduaneira – Entidade responsável pela administração e fiscalização dos impostos em Portugal."
    
    Example 2:
    Input:
    "Bem-vindo à assistente virtual do INSS. Para melhorar nossos serviços, coletamos dados conforme nossa política de privacidade. Consulte nosso site para mais informações. Meu nome é INSSBot e estou aqui para esclarecer dúvidas sobre aposentadoria, benefícios sociais e contribuições previdenciárias."
    
  Expected output :
    "INSS – Instituto Nacional do Seguro Social, responsável pela administração de aposentadorias e benefícios previdenciários no Brasil."
    
    Now, generate output based on next Message:
    "{input}"
    `);

    export const promptSubjectAnalysisChatbot = PromptTemplate.fromTemplate(`
      You are a chatbot analyst. Based only on the title of the chatbot, return the services it most likely offers **without requiring login or personal information**.
                   
               Chatbot Title: {chatbot_title}
              Answer should come in the language and terms of the country and region of the chatbot, that you can identify by the title, use also known acronyms if needed.
              Your output must be comma separated values with no additional text, comments, or explanations.
              `);
   
  
      export const confidenceLevelEvaluatorWithExamples = PromptTemplate.fromTemplate(`
        You are a Goal Completion Evaluator and your role is to determine if the given objective is complete based on the provided answer.
        
        Objective:
        {objectiveLLM}
        
        Answer:
        {answer}
      
        Rules:  
        If the input meets the objective with a confidence level of 80 or higher, you should return:
        confidence should be a number between 0 and 100, with 0 being the lowest and 100 being the highest.
        No extra information or comments should be included in the answer.
        If the input is empty or does not meet the objective, return 0.
        Also from text return parts of the text that are relevant to the objective.


      
        Few-shot examples:
        {examples}

        Format instructions:
        {formatInstructions}
        
        `);
export const confidenceLevelEvaluatorWithExamplesB = PromptTemplate.fromTemplate(`
  You are a Goal Completion Evaluator and your role is to determine if the given objective is complete based on the provided answer.
  
  Objective:
  {objectiveLLM}
  
  Answer:
  {answer}
 
  Rules:  
  If the input meets the objective with a confidence level of 80 or higher, you should return:
  confidence should be a number between 0 and 100, with 0 being the lowest and 100 being the highest.
  No extra information or comments should be included in the answer.
  If the input is empty or does not meet the objective, return 0.


 
  Few-shot examples:
  {examples}

  Format instructions:
  {formatInstructions}
   
  `);


  export const promptGetQuestionWithExamples = PromptTemplate.fromTemplate(`
    You are an AI agent responsible for assessing the accessibility and clarity of another chatbot's responses.
    
    **Objective:**  
    Your task is to ask one concise, question at a time to help you obtain specific, clear, and actionable information following Objective:
    
    {objective}
    
    ---
    
    **Instructions:**
    
    1. **Memory and Reasoning:**
       - Before asking a new question, review the full chat history and assess:
         - Did the last question achieve progress toward the objective?
         - Was the last response clear, useful, or did it ignore/misunderstand the request?
    
    2. **Adaptation Strategy:**
       - If the last response did not clearly advance the objective, **change your questioning strategy** immediately.
       - Avoid repeating similar types of questions (e.g., don't just reword the same idea).
       - Choose a new angle, structure, or approach that may work better.
    
    3. **Question Generation:**
       - Ask only one clear, concise question at a time.
       - Prioritize directness and relevance to the objective.
       - Never include explanations, comments, or multiple questions at once.
    
    4. **Language Matching:**
       - Always ask your questions in the same language that the chatbot is using.
    
    5. **Example Handling:**
       - Use the knowledge accumulated from previous conversation turns to fine-tune your next question.
    
    ---
    
    **Important Rules:**
    
    - Never repeat a previously asked question (even if phrased differently).
    - Be proactive: if multiple attempts fail, radically change questioning style (e.g., from open-ended to yes/no, or from direct to indirect approaches).
    - Your ultimate goal is to **achieve the objective quickly** by intelligent questioning.
    
    {examples}
    `);

  export const promptGetQuestionWithExamplesB = PromptTemplate.fromTemplate(`
    You are an AI agent that interacts with another chatbot, Your role is to ask one concise question at a time to reach the objective:
  
    The objective of your question is:
  
    {objective}
  
    Task:
    Ask a question to achieve objective, you should not repeat question based on history of chat.
    You should change the strategy and type of question if previous strategies dont work for more than 1 times.
    To help you should use the knowledge you build of chatbot from the previous conversation.
  
    Guidelines:
    Avoid long questions and keep them concise, clear, and relevant.
    Reason with chat history and ask questions that will help you achieve the objective.
    Ask only one short, clear question at a time.
    Focus on the most relevant question based on the assistant's previous response.
    If needed, reformulate or move to a different question without repeating previous ones.
    No extra information or comments should be included in the question.
    Ask in the same language the chatbot is using.

    {examples}
  `);
  
  
  

/** Prompt to detect the type of message in HTML
 * 
 * {previousMessage} is the previous message that the user sent to the chatbot
 * 
 * {code} is the HTML code that the chatbot sent to the user
 * 
 */
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

/** Prompt to extract options from HTML message of type Options
 * 
 * {code} is the HTML code that the chatbot sent to the user
 * 
 * {formatInstructions} is the format of the output
 * 
 */
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

/**Prompt to choose from query of chatbot that has choices
 * 
 * {message} is the message that the user sent to the chatbot
 * {options} is the options that the chatbot gave to the user
 * {objective} is the current objective of the user
 * 
 */            
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