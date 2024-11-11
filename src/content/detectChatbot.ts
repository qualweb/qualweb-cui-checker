import { showMessage } from '../utils/helpers';
import { LLMResponse } from '../utils/types';
import { setStoredChatbotElement, flashGreen } from './selectChatbot';
import { sendPromptToLLM } from './selectChatbotLLM';
import { setStoredMicrophoneButton } from './selectVoiceinput';




/**Function to request elements from LLM after cleaning the HTML to reduce size of tokens sent to LLM
 *  
 **/ 
export function requestElementsLLM() {
  // Obter window document

  let documentBody: HTMLBodyElement = document.body as HTMLBodyElement;
  let clonedBody = documentBody.cloneNode(true) as HTMLBodyElement;
  console.log("size before sending: " + documentBody.outerHTML.length);
  
// Remove unnecessary elements
const tagsToRemove = ['header', 'footer', 'script', 'style', 'link', 'noscript', 'iframe', 'object', 'embed'];
tagsToRemove.forEach(tag => {
  clonedBody.querySelectorAll(tag).forEach(element => element.remove());
});

console.log("size after removing unnecessary elements: " + clonedBody.outerHTML.length);

// Remove regular comments
clonedBody.innerHTML = clonedBody.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

// Remove conditional comments (IE-specific)
clonedBody.innerHTML = clonedBody.innerHTML.replace(/<!--[^\]]*?\[if[^\]]*?\]>[\s\S]*?<!\[endif\]-->/g, '');

console.log("size after removing comments and conditional comments: " + clonedBody.outerHTML.length);

// send cleanedBody to LLM
 sendPromptToLLM(clonedBody.innerHTML).then((elements: LLMResponse) => {
    


    // Check if chatbot element is present
  if(elements.xpath_chatbot !== null){
    let parentElement = getElementByXpath(elements.xpath_chatbot);
    if(parentElement){
      showMessage("Elements identified.");
      setStoredChatbotElement(parentElement);
      flashGreen(parentElement);
      chrome.runtime.sendMessage({ action: "storeHTML", html: parentElement }, () => {
        showMessage("Chatbot element identified and HTML stored!");
      });
    }else{
        throw new Error("Error: Couldn't identify chatbot element. Please try again.");
    }
  }

  // Check if microphone element is present
  if(elements.xpath_microphone !== null){
    let microphoneElement = getElementByXpath(elements.xpath_microphone);
    if(microphoneElement){
      flashGreen(microphoneElement);
      setStoredMicrophoneButton(microphoneElement);
    }
  }

  
 }).catch((error) => {
   console.error(error);
  showMessage("Error: Couldn't identify chatbot elements. Please try again.");
  });



}

function getElementByXpath(path: string): HTMLElement | null {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
}
