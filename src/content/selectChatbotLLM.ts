import { showMessage } from '../utils/helpers';
import { ElementSelector, LLMResponse } from '../utils/types';
import axios from 'axios';

const LLM_URL = 'https://api.openai.com/v1/chat/completions';
const LLM_LOCAL_URL = 'http://localhost:11434/api/generate';
const API_KEY = '';

interface LocalLLMResponse {
  xpath_input: string | null;
  xpath_conversation: string | null;
  xpath_bot_selector: string | null;
  xpath_microphone: string | null;
}

let prompt = `
Role Context:
You are an HTML analyzer. Your task is to identify and return the exact XPATHs related to a chatbot interface from the provided HTML structure. Analyze class names, IDs, attributes (like data-*), and other relevant properties.

Task Context:
From the following HTML, identify and return the VALID XPATH for:

1. The **chatbox** element that contains the conversation between the chatbot and the person and the input for text and to send message.
2. If present, the **microphone button** used to activate microphone input for the prompt.

If an element is not found, return null. Return only the raw JSON object without any code blocks, markdown, or extra text.

Here is the structure for the response:
{
  "xpath_chatbot": "XPATH_OR_NULL",
  "xpath_microphone": "XPATH_OR_NULL"
}

HTML to Analyze: `;


/** Function to send the prompt to LLM and get the response
 * 
 * @param body 
 * @returns 
 */

const sendPromptToLLM = async (body:string): Promise<LLMResponse>  => {

let promptToSend = `${prompt} \n ${body}`;


  return axios.post(LLM_URL, 
    {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: promptToSend }],
      temperature: 0.3,
      top_p: 0.9
      
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  ).then((response) => {
    
    const reply = response.data.choices[0].message.content;

    const parsedReply: LLMResponse = JSON.parse(reply);
    
    return parsedReply;

  }).catch(() => {


    return {
      xpath_chatbot: null,
      xpath_microphone: null
    } as LLMResponse;

  });

}


const sendPromptTLocalLLM = async (body:string): Promise<LocalLLMResponse>  => {

  let promptToSend = `${body}`;
  
  
    return axios.post(LLM_LOCAL_URL, 
      {
        model: 'HTML2',
        prompt: promptToSend,
        format: "json",
        stream: false,
        
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((response) => {
     
      const reply = response.data.response;
  
      console.log(reply);
      
      const parsedReply: LocalLLMResponse = JSON.parse(reply);
    
      return parsedReply;
    }).catch(() => {
  
  
      return {
        xpath_input: null,
        xpath_conversation: null,
        xpath_bot_selector: null,
        xpath_microphone: null

      } as LocalLLMResponse;
  
    });
  
  }

export {sendPromptToLLM,sendPromptTLocalLLM}
