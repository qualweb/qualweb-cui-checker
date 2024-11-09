import { showMessage } from '../utils/helpers';
import { ElementSelector } from '../utils/types';
import axios from 'axios';

const LLM_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_ATTEMPTS = 3;
const API_KEY = 'your-api-key';


let prompt = `Role Context: You are an HTML analyzer. Your task is to identify and return specific XPATH related to a chatbot interface based on the provided HTML structure. You should analyze class names, IDs, attributes like data-*, and other relevant properties.

Task Context: From the following HTML, identify and return the exact XPATH responsible for:

1. The text input area used for sending prompts.
2. The button used to send prompts. 
3. The button used to activate microphone input for the prompt.

Return a json with the XPATH of elements asked or null if not found

Example output:
{
  "chat": "chatgpt-model",
  "xpath_text": "//*[@id="app-root"]/chat-window/div[1]/div[2]/",
  "xpath_send": "//*[@id="app-root"]/chat-window/div[1]/div[2]/"
  "xpath_sound":  "//*[@id="app-root"]/chat-window/div[1]/div[2]/"
}

HTML to Analyze: `;

interface LLMResponse {
  model:string;
  xpath_text: string | null;
  xpath_send: string | null;
  xpath_sound: string | null;
}
// 1 - get appropriate parent element
/*
function readFilePrompt(): string | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading the file:', err);
    return null;
  }
}
*/
//2 - build prompt for LLM

//3 - send prompt to LLM

// TODO: need to make a interface for type of response to use in Promise
const sendPromptToLLM = async (bodyInnerHTML:string): Promise<LLMResponse>  => {
//let promptDemo = readFilePrompt();
let promptToSend = prompt + "\n" + bodyInnerHTML;


  // Use text interpolation with the content from the file
  
   await axios.post(LLM_URL, 
    {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: promptToSend }],
      temperature: 0.5,
      top_p: 0.9
      
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  ).then((response) => {
    console.log(response.data);
    const reply = response.data.choices[0].message.content;
    console.log(reply);
    const parsedReply: LLMResponse = JSON.parse(reply);
    return parsedReply;
  }).catch((error) => {
    console.log(error);
    return {
      model: '',
      xpath_text: null,
      xpath_send: null,
      xpath_sound: null
    } as LLMResponse;
  });
  return {
    model: '',
    xpath_text: null,
    xpath_send: null,
    xpath_sound: null
  } as LLMResponse;
}

export {sendPromptToLLM}
//4 - receive response from LLM

//5 - validate if response is correct and elements is adquired

//6 - if not valid request new prompt again with a max of 3 attempts

//6 - return element