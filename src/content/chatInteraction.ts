import { getSentMessage, responses, setSentMessage } from './content';
import { ChatResponse } from '../utils/types';
import { chatbotInterface, ChatBotInterface } from './detectChatbot';

export function simulateInput(message: string , chatbotInterface: ChatBotInterface) {
  const textEditor = chatbotInterface.inputElement;
  if (textEditor?.tagName === 'DIV') {
    if(message != ""){
    setSentMessage(message);
    textEditor.innerHTML = message;
    }else{
      // text was voice input
      setSentMessage(textEditor.innerText);
    }
    textEditor.focus();
    dispatchEvents(textEditor);
  } else if (textEditor?.tagName === 'INPUT' || textEditor?.tagName === 'TEXTAREA') {
    if(message != ""){
    setSentMessage(message);
    textEditor.focus();
    (textEditor as HTMLInputElement | HTMLTextAreaElement).value = message;
    }else{
      // text was voice input
      setSentMessage((textEditor as HTMLInputElement | HTMLTextAreaElement).value);
      textEditor.focus();
    }
    dispatchEvents(textEditor);
  } else {
    console.error("Input field or rich text editor not found.");
  }
}

function dispatchEvents(element: HTMLElement) {
 
  const inputEvent = new Event('input', { bubbles: true });
  element.dispatchEvent(inputEvent);
  setTimeout(() => {
  const keyboardEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
  });
  element.dispatchEvent(keyboardEvent);
}
, 100  );
}

export async function captureResponse(message: string, chatbotElement: ChatBotInterface, maxWaitTime = 20000): Promise<ChatResponse> {
  const startTime = Date.now();
  let response:ChatResponse = { message, response: [] };
 return await observeNewMessages(message,chatbotElement.historyElement!);
}

let observer:MutationObserver;

function observeNewMessages(messageClient:string,element:HTMLElement):Promise<ChatResponse>{
  return new Promise((resolve, reject) => {

    // Elements that could be a response
    let PossibleResponseElements:HTMLElement[] =[];
    let timeOutId = setTimeout(() => {
      observer.disconnect();
      let responseText = PossibleResponseElements.map((element) => element.textContent || element.innerText).filter((text) => text !== messageClient);
      resolve({message: messageClient, response: responseText});
    },5000);
    function restartTimer(){
      clearTimeout(timeOutId);
      timeOutId = setTimeout(() => {
        observer.disconnect();
        let responseText = PossibleResponseElements.map((element) => element.textContent || element.innerText).filter((text) => text !== messageClient);
        resolve({message: messageClient, response: responseText});
      },5000);
    }
   observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Added Nodes  
      
      for(let addedNode of Array.from(mutation.addedNodes)){
        if (addedNode.nodeType === Node.ELEMENT_NODE) {

          if (Array.from(element.children).includes(addedNode as HTMLElement)) {
          console.log("É filho direto");
          }else{
            console.log("Não é filho direto");
          }
          
          PossibleResponseElements.push(addedNode as HTMLElement);
          console.log('Added Node:', addedNode);
          restartTimer();
          
       }
      }
      mutation.removedNodes.forEach((node) => {
        PossibleResponseElements = PossibleResponseElements.filter((element) => element !== node);
        console.log('Removed Node:', node);
        console.log('PossibleResponseElements:', PossibleResponseElements);
        restartTimer();
      });


    });
  });
  observer.observe(element, {
    childList: true,
    subtree: true,

});

  });

}

export async function sendAndReceiveMessage(message: string, chatbotElement: ChatBotInterface): Promise<ChatResponse> {
  simulateInput(message, chatbotElement);
  return await captureResponse(message, chatbotElement);
}

