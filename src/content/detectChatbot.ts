import { showMessage } from '../utils/helpers';
import { LLMResponse } from '../utils/types';
import { setStoredChatbotElement, flashGreen } from './selectChatbot';
import { sendPromptTLocalLLM, sendPromptToLLM } from './selectChatbotLLM';
import { setStoredMicrophoneButton } from './selectVoiceinput';





interface SelectorsRelevant {
  classes: string[];
  properties: string[];
  tags: string[];
  dataAttributes: string[];
}


export interface ChatBotInterface  {
  inputElement: HTMLElement | HTMLInputElement | HTMLTextAreaElement | null;
  messagesSelector: string ;
  historyElement: HTMLElement | null;
  microphoneElement: HTMLElement | null;
}


interface LocalLLMResponse {
  xpath_input: string | null;
  xpath_history: string | null;
  xpath_bot_selector: string | null;
  xpath_microphone: string | null;
}

export let  chatbotInterface: ChatBotInterface | null = null;

let observer: MutationObserver;

function cleanHTML(documentBody: Element): Element {

  let clonedBody = documentBody.cloneNode(true) as Element;
  console.log("size before sending: " + documentBody.outerHTML.length);
  console.log("size before cleaning element attr: " + clonedBody.outerHTML.length);
// remove all attributes that are not "id or class"
clonedBody.querySelectorAll('*').forEach(element => {
  Array.from(element.attributes).forEach(attr => {
    if (attr.name !== 'id' && attr.name !== 'class') {
      element.removeAttribute(attr.name);
    }
  });
});

  console.log("size after cleaning element attr: " + clonedBody.outerHTML.length);
  
// Remove unnecessary elements
const tagsToRemove = ['header', 'footer','img','svg',  'script', 'style', 'link', 'noscript', 'iframe', 'object', 'embed'];
tagsToRemove.forEach(tag => {
  clonedBody.querySelectorAll(tag).forEach(element => element.remove());
});

console.log("size after removing unnecessary elements: " + clonedBody.outerHTML.length);

// Remove regular comments
clonedBody.innerHTML = clonedBody.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

// Remove conditional comments (IE-specific)
clonedBody.innerHTML = clonedBody.innerHTML.replace(/<!--[^\]]*?\[if[^\]]*?\]>[\s\S]*?<!\[endif\]-->/g, '');
console.log("size after removing comments and conditional comments: " + clonedBody.outerHTML.length);
// remove style and transformations
clonedBody.querySelectorAll('*').forEach(element => {
  element.removeAttribute('style');
  element.removeAttribute('transform');
});

return clonedBody;
}


/**Function to request elements from LLM after cleaning the HTML to reduce size of tokens sent to LLM
 *  
 **/ 
export function requestElementsLLM() {
  // Obter window document

  let documentBody: HTMLBodyElement = document.body as HTMLBodyElement;


  let clonedBody = cleanHTML(documentBody);

// send cleanedBody to LLM
 sendPromptToLLM(clonedBody.innerHTML).then((elements: LLMResponse) => {
    


    // Check if chatbot element is present
  if(elements.xpath_chatbot !== null){
    let parentElement = getElementByXpath(elements.xpath_chatbot,document);
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
    let microphoneElement = getElementByXpath(elements.xpath_microphone,document);
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

function getElementByXpath(path: string, documentChatbot:Document): HTMLElement | null {
  return documentChatbot.evaluate(path, documentChatbot, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
}

function camelToKebabCase(camelCaseStr) {
  return camelCaseStr
      .replace(/([A-Z])/g, '-$1') 
      .toLowerCase();            
}

function identifyElementsChatbot(element:Element){
  const documentChatbot = element.ownerDocument;

  let LLMResponse:LocalLLMResponse;

let clonedBody = cleanHTML(element);

sendPromptTLocalLLM(clonedBody.outerHTML).then((response: LocalLLMResponse) => {
    chatbotInterface = {
      inputElement: null,
      messagesSelector: '',
      historyElement: null,
      microphoneElement: null
    };
      

    LLMResponse = response;
    if (LLMResponse.xpath_input){
      let inputElement = getElementByXpath(LLMResponse.xpath_input,documentChatbot);
      
      if(inputElement){
        flashGreen(inputElement);
        chatbotInterface.inputElement = inputElement;
      }
    }
    if(LLMResponse.xpath_history){
      let historyElement = getElementByXpath(LLMResponse.xpath_history,documentChatbot);
      if(historyElement){
        flashGreen(historyElement);
      //  observeNewMessages(historyElement);
        chatbotInterface.historyElement = historyElement;
        
      }
    }
    if(LLMResponse.xpath_bot_selector){

      let chatbotElement = getElementByXpath(LLMResponse.xpath_bot_selector,documentChatbot);

      if(chatbotElement){
        flashGreen(chatbotElement);
        chatbotInterface.messagesSelector = LLMResponse.xpath_bot_selector;



      }
    }
    if(LLMResponse.xpath_microphone){
      let microphoneElement = getElementByXpath(LLMResponse.xpath_microphone,documentChatbot);
      if(microphoneElement){
        flashGreen(microphoneElement);
        chatbotInterface.microphoneElement = microphoneElement;
      }
    }
   
  });
}



export function detectChatbotSelection() {
  // add mutation Observer
  observeForMutation().then((identify:HTMLElement) => {
    console.log("Found probable chatbot element, and it is going to send to LLM");
   
    identifyElementsChatbot(identify as HTMLElement);


   }).catch(() => {

    console.log("Mutation observer disconnected");
   });
  // wait for identified mutation
  
  


}


function getElements(selectors:SelectorsRelevant):Set<Element>{
  let elements:Set<Element> = new Set();

  selectors.classes.forEach((className) => {
    let elementsWithClass = document.getElementsByClassName(className);
    Array.from(elementsWithClass).forEach(element => elements.add(element));
  });

  selectors.properties.forEach((property) => {
    let elementsWithProperty = document.querySelectorAll(`[${property}]`);
    Array.from(elementsWithProperty).forEach(element => elements.add(element));
  });

  selectors.tags.forEach((tag) => {
    let elementsWithTag = document.getElementsByTagName(tag);
    Array.from(elementsWithTag).forEach(element => elements.add(element));
  });

  selectors.dataAttributes.forEach((dataAtr) => {
    let elementsWithDataAtr = document.querySelectorAll(`[data-${dataAtr}]`);
    Array.from(elementsWithDataAtr).forEach(element => elements.add(element));
  });



  return elements;


}

function getFilteredSelectors(element: HTMLElement):Set<Element>  {

  let elements:Set<Element> = new Set();

  let allElements = element.querySelectorAll("*");
  // Get a list of Relant keywords and add them to regex word
  let regex =  "[A-Za-z0-9]*(chat|assistant|prompt|conversation)[A-Za-z0-9]*";
  allElements.forEach((element) => {
    let isRelevant = false;
    // Check if there are tags that are relevant for a chatbot
     isRelevant = isRelevant || element.localName.match(regex) ? true : false;

     if (isRelevant) {
       elements.add(element);
       return;
     }

     // Check if there are classes name that are relevant for a chatbot
     element.classList.forEach((className) => {
      if(className.match(regex)){
        elements.add(element);
        return;
      }
      });

      // relevant title or aria
      if((element as HTMLElement).title && (element as HTMLElement).title.match(regex)){
        elements.add(element);
        return;
      }
     

      // Check if there are properties that are relevant for a chatbot
      Array.from(element.attributes).forEach((attr: Attr) => {
        if(attr.name.match(regex)){
          elements.add(element);
          return;
        }
      });
      

      // get any data-* attributes that are relevant for a chatbot
      for (let dataAtr in (element as HTMLElement).dataset) {
        if (dataAtr.match(regex)) {
          elements.add(element);
          return;
        }
        //  check if value inside data-* attribute is relevant
        if((element as HTMLElement).dataset[dataAtr]!.match(regex)){
          elements.add(element);
          return;
        }
      }
      
  });
 

  return elements;

}

function addMutationIframe(iframe:HTMLIFrameElement){
  iframe.addEventListener('load', () => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDocument) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {

                console.log('Added Nodes in iframe:', mutation);
                
            }
          });
            });
        });

        observer.observe(iframeDocument.body, {
            childList: true,
            attributes: true,
            attributeFilter: ['class','style'],
            subtree: true
        });


    } else {
        console.error('Failed to access iframe document.');
    }
});

}

function waitForIframeLoad(iframe):Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    let iframeDoc = iframe.contentDocument || iframe.contentWindow.document ;
    console.log("Iframe Doc",iframeDoc);
      if (iframeDoc && iframeDoc.readyState === "complete" ) {
          // Se já está carregado
          console.log("Iframe was already loaded");
          resolve(iframe);
      } else {
        console.log("Iframe was not loaded, waiting for load event");
          iframe.addEventListener("load", function onLoad() {
              iframe.removeEventListener("load", onLoad); 
              resolve(iframe);
          });

          setTimeout(() => reject(new Error("Iframe load timed out.")), 100000);
      }
  });
}
/*
function observeNewMessages(element:HTMLElement){
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          console.log('Added Nodes:', mutation);
          
      }
    });
    });
  });
  observer.observe(element, {
    childList: true,
    attributes: true,
    subtree: true
});

}
*/
function observeForMutation():Promise<HTMLElement>{

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver((mutations) => {
      let stopMutationLoop = false;
      for (const mutation of mutations) {
        if (stopMutationLoop) {
          break
        }
        if (mutation.type === "attributes" ) {
          
          const element = mutation.target as HTMLElement;

          // Filtrar por estilo específico
          if (getComputedStyle(element).display !== "none") {
            if(element.querySelectorAll("iframe").length > 0){
             
                    let iframes = element.querySelectorAll("iframe");
                    console.log("Iframes: ", iframes);

                    let resolved = false;
                    for(let i = 0; i < iframes.length; i++){
                    
                    if(resolved){
                
                      break;
                    }
                     waitForIframeLoad(iframes[i] as HTMLIFrameElement).then((iframe) => {

                      let iframeContent:Document | null = (iframe as HTMLIFrameElement).contentDocument;
                    
                      if(iframeContent){
                      
                        let score = scoringTreeChatbot(iframeContent.body as HTMLElement);

                        if(score> 10){
                          resolved = true;
                          stopMutationLoop = true;
                          observer.disconnect();
                          resolve(iframeContent.body);

                        }
                      }
                    }).catch((error) => {
                      
                      console.log("Iframe not loaded %s",error);
                      });
                 
              
                    }


              }else{ 
                // iF element is not a iframe
       
                let score = scoringTreeChatbot(element as HTMLElement);
                  
                        if(score> 10){
                          stopMutationLoop = true;
                          observer.disconnect();
                          resolve(element);        

                        }
              }
            
          } 
      }
       
      }
    
  });
    
    
  observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true
});


    setTimeout(() => {
      observer.disconnect();
      reject();
    }, 15000);
  });

}






function scoringTreeChatbot(element:HTMLElement):number{
  let score:number = 0;
  let elementToScore = element as HTMLElement;
  /// is element loaded a iframeDocument or shadowRoot and is loaded?
  let allElements = elementToScore.querySelectorAll("*");
  let hasInputArea = elementToScore.querySelectorAll("input[type='text'], textarea, div[contenteditable='true']").length > 0;
  //console.log("Has input area: ", hasInputArea);
  if(!hasInputArea){
    return 0;
  }else{
    score=+10;
  }
  // Get a list of Relant keywords and add them to regex word
  let regex:RegExp = /[\s\S]*(chat|assistant|prompt|conversation)[\s\S]*/;
  //let regex =  "[A-Za-z0-9]*(chat|assistant|prompt|conversation)[A-Za-z0-9]*";

  allElements.forEach((element) => {


    // Check if there are tags that are relevant for a chatbot
     element.localName.match(regex) ? score++ : null;

    // Check if there are classes name that are relevant for a chatbot
     element.classList.forEach((className) => {

      if(className.match(regex)){
         score++;
      }
      });

      // Check if there are properties that are relevant for a chatbot
      Array.from(element.attributes).forEach((attr) => {
        if(attr.name.match(regex)){
          score++;
        }
      });
      

      // get any data-* attributes that are relevant for a chatbot
      for (const dataAtr in (element as HTMLElement ).dataset) {
        if (dataAtr.match(regex)) {
          score++;
        }
        if ((element as HTMLElement).dataset[dataAtr]!.match(regex)) {
          score++;
        }
      }
      
  });

  return score;
}



