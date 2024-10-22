import { showMessage } from '../utils/helpers';
import { ElementSelector } from '../utils/types';
import axios from 'axios';
import * as fs from 'fs'; 
import * as path from 'path';

const LLM_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_ATTEMPTS = 3;
const API_KEY = '';

const filePath = path.join(__dirname, 'prompt.txt');


let isActive:boolean = false;
let parentElement: HTMLElement | null = null;

// 1 - get appropriate parent element

function readFilePrompt(): string | null {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading the file:', err);
    return null;
  }
}
function getParentElement(): HTMLElement | null {
  let body = document.body;

  if (!body) {
    return null;
  }


  return body;
}

//2 - build prompt for LLM

//3 - send prompt to LLM

const sendPromptToLLM = async ()  => {
let promptDemo = readFilePrompt();



  // Use text interpolation with the content from the file
  
   axios.post(LLM_URL, 
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptDemo }],
      temperature: 0.7,
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
  }).catch((error) => {
    console.log(error);
  }
  );


}
sendPromptToLLM();
//4 - receive response from LLM

//5 - validate if response is correct and elements is adquired

//6 - if not valid request new prompt again with a max of 3 attempts

//6 - return element