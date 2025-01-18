import { sendAndReceiveMessage } from './chatInteraction';
import { elementSelector, setGreen, unsetGreen } from './selectChatbot';
import {chatbotInterface,detectChatBotPopupMutation,identifyElementsChatbot, correctElementChatbot,cleanHTML } from './detectChatbot';
import { ResponseStore,ChatBotInterface, ChatResponse, Summary } from '../utils/types';
import { locale_en } from '../locales/en';
import { addValuesToSummary, filterResults } from '../utils/evaluationHelpers';
import { microphoneSelector, getStoredMicrophoneButton } from './selectVoiceinput';
import { showMessage } from '../utils/helpers';


let tabRoute = null;


export let responses: ResponseStore = {};
let sentMessage: string = '';
let summary: Summary;
let chatbotSummary: Summary;
let currentVerification: HTMLElement[] | HTMLElement | null = null;
let HTMLCode: string = '';
let documentOwner:Document;
export function getSentMessage(): string {
  return sentMessage;
}

export function setSentMessage(message: string): void {
  sentMessage = message;
}

// Main message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {



  switch (request.action) {
    case "saveRoute":
      tabRoute = request.route;
      sendResponse({ status: "route saved" });
      console.log("Route saved:", tabRoute);
      break;
    case "getRoute":
      console.log("getRoute ", tabRoute);
      sendResponse({ route: tabRoute });
      break;
    case 'typeMessages':
      handleTypeMessages(request, chatbotInterface).then(chatResponses => {
        console.log(chatResponses);
        sendResponse({ status: 'Messages typed and responses received', responses: chatResponses });
      });
      return true; // Indicates that the response is sent asynchronously
    case "startSelection":
      console.log("started normal selection");
      elementSelector.startSelection();
      break;
    case "requestElementLLM":
      console.log("started Selection LLM");
      showMessage("Please open the chatbot");
      (async () => {
        
       let htmlElement = await detectChatBotPopupMutation();
       documentOwner = htmlElement.ownerDocument;
       HTMLCode = cleanHTML(htmlElement);
       
      const chatbot = await identifyElementsChatbot(HTMLCode,documentOwner);
      let chatBotElements = {};
      if(chatbot){
        chatBotElements = {
          inputElement: Boolean(chatbot.inputElement),
          messagesSelector: Boolean(chatbot.messagesSelector),
          dialogElement: Boolean(chatbot.dialogElement),
          microphoneElement: Boolean(chatbot.microphoneElement),
          windowElement: Boolean(chatbot.windowElement)
        };
      }
   
      sendResponse({ status: 'Chatbot elements identified', chatbot:chatBotElements });
      })();
      return true;
    case "startVerification":
        let elementName = request.element;
        console.log("chatBotElements and selectors ",chatbotInterface!.selectors);
        if (elementName === "windowElement") {
          currentVerification = chatbotInterface!.windowElement!;
          setGreen(chatbotInterface!.windowElement!);
         
        }else if (elementName === "inputElement") {
          currentVerification = chatbotInterface!.inputElement!;
          setGreen(chatbotInterface!.inputElement!);
        }else if (elementName === "dialogElement") {
          currentVerification = chatbotInterface!.dialogElement!;
          setGreen(chatbotInterface!.dialogElement!);
        }else if (elementName === "microphoneElement") {
          currentVerification = chatbotInterface!.microphoneElement!;
          setGreen(chatbotInterface!.microphoneElement!);
        }else if (elementName === "messagesSelector") {
          const result = documentOwner.evaluate(chatbotInterface!.messagesSelector, documentOwner, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
          const elements:HTMLElement[] = [];

          const numNodes = result.snapshotLength;
          for (let i = 0; i < numNodes; i++) {
            const node = result.snapshotItem(i);
            if (node instanceof HTMLElement) { 
              elements.push(node);
            }
          }
          currentVerification = elements;
          currentVerification.forEach((element) => {
            setGreen(element);
          });
        }
        sendResponse({ status: 'Please confirm the selection of the chatbot window' });
      break;

    case "endSucessfulVerification":
     if(currentVerification){
       unsetGreen(currentVerification);
      sendResponse({ status: 'confirmed' });
     }else{
      sendResponse({ status: 'Nothing to confirm' });
     }
     
      break;
    case "correctElementSelection":
      unsetGreen(currentVerification!);
      currentVerification = null;
      (async () => {
      let elementToCorrect = request.element;
      let chatbotCorrection = await correctElementChatbot(HTMLCode,documentOwner,elementToCorrect);
      let chatBotElements = {};
      if(chatbotCorrection){
        chatBotElements = {
          inputElement: Boolean(chatbotCorrection.inputElement),
          messagesSelector: Boolean(chatbotCorrection.messagesSelector),
          dialogElement: Boolean(chatbotCorrection.dialogElement),
          microphoneElement: Boolean(chatbotCorrection.microphoneElement),
          windowElement: Boolean(chatbotCorrection.windowElement)
        };
      }
      sendResponse({ status: 'Chatbot element corrected', chatbot:chatBotElements });
    })();
     
     return true;
    case "startMicSelection":
      microphoneSelector.startMicrophoneSelection();
      break;
    case "startEvaluation":
      summary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
      // only assign chatbotsummary is chatbot element is not null
      if (chatbotInterface!.windowElement) {
        chatbotSummary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
      }
      sendResponse([summary, chatbotSummary]);
      break;
    case "startVoiceInput":
      
      /// start tts generation
      handleVoiceInput(request, null).then(chatResponses => {
        sendResponse({ status: 'Messages Audio input send and responses received', responses: chatResponses });
      });
      break;
    case "evaluateACT":
      const actResult = evaluateACT(chatbotInterface!.windowElement);
      sendResponse(actResult);
      break;
    case "evaluateWCAG":
      const wcagResult = evaluateWCAG(chatbotInterface!.windowElement);
      sendResponse(wcagResult);
      break;
    case "evaluateCUI":
      const cuiResult = evaluateCUI(chatbotInterface!.windowElement);
      sendResponse(cuiResult);
      break;
    case "endingEvaluation":
      sendResponse([summary, chatbotSummary]);
      break;
    default:
      console.error("Unknown action:", request.action);
  }
});

// Function to handle typing messages
async function handleTypeMessages(request: { messages: string[] }, chatbotInterface: ChatBotInterface | null): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];

  for (let i = 0; i < request.messages.length; i++) {
    const message = request.messages[i];
    let response: ChatResponse ;

    if (chatbotInterface) {
      response = await sendAndReceiveMessage(message, chatbotInterface);
      chatResponses.push(response);
    } else {
     // response = await sendAndReceiveMessage(message);
    }

    if (i < request.messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return chatResponses;
}


//Function to hantdle Voice input with tts
async function handleVoiceInput(request: {messages: string[]}, chatbotElement: HTMLElement | null): Promise<ChatResponse[]> {
  let chatResponses: ChatResponse[] = [];

  for(let i = 0; i < request.messages.length; i++) {

    const message = request.messages[i];
    let response: ChatResponse;
    
    chatbotInterface?.microphoneElement!.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    // Logic for voice input
    await sendMessageToBackground("speakText", message);
    await new Promise(resolve => setTimeout(resolve, 500));
    getStoredMicrophoneButton()!.click();
    
    if (chatbotElement) {
     // response = await sendAndReceiveMessage("", chatbotElement);
      
    } else {
    //  response = await sendAndReceiveMessage("");
    }

    //chatResponses.push(response);
    
    
  }

  return chatResponses;

}

// Function to send message to background 
function sendMessageToBackground(action: string, text: string):Promise<void> {
  return new Promise((resolve, reject) => {
  chrome.runtime.sendMessage({action, text}, () => {
    if(chrome.runtime.lastError) {
      return reject(chrome.runtime.lastError);
    }
    resolve();
  
  });

});
}




function evaluateACT(chatbotElement: HTMLElement|null) {

  let actResult, chatbotActResult, result, chatbotResult;
  const excludedRules = [
    'QW-ACT-R1', 'QW-ACT-R2', 'QW-ACT-R3', 'QW-ACT-R4', 'QW-ACT-R5', 'QW-ACT-R6', 'QW-ACT-R7', 'QW-ACT-R8'
  ];
  let sourceHtml = document.documentElement.outerHTML;

  window.act = new ACTRulesRunner({ translate: locale_en, fallback: locale_en });
  // window.act.configure({ exclude: excludedRules })
  //window.act.validateFirstFocusableElementIsLinkToNonRepeatedContent();
  window.act.test({ sourceHtml });
  
  actResult =  window.act.getReport();

  addValuesToSummary(summary, actResult);



  result = actResult.assertions;

  if (chatbotElement) {
    chatbotActResult = filterResults(actResult, chatbotElement);
    console.log("chatbotActResult", chatbotActResult);
    addValuesToSummary(chatbotSummary, chatbotActResult);
    chatbotResult = chatbotActResult.assertions;
  };
  console.log("result:", summary);
  console.log("chatbotResult:", chatbotResult);
  return [result, chatbotResult];
}

function evaluateWCAG(chatbotElement: HTMLElement|null) {
  let htmlResult, chatbotHtmlResult, result, chatbotResult;
  const excludedTechniques = [
    'QW-WCAG-T14', 'QW-WCAG-T15', 'QW-WCAG-T16', 'QW-WCAG-T17', 'QW-WCAG-T18', 'QW-WCAG-T19', 'QW-WCAG-T20', 'QW-WCAG-T21', 'QW-WCAG-T22'
  ];
  window.wcag = new WCAGTechniquesRunner({ translate: locale_en, fallback: locale_en });
  let sourceHtml = document.documentElement.outerHTML;
  // window.wcag.configure({ exclude: excludedTechniques })
  htmlResult = window.wcag.test({sourceHtml}).getReport();
  addValuesToSummary(summary, htmlResult);
  result = htmlResult.assertions;

  if (chatbotElement) {
    chatbotHtmlResult = filterResults(htmlResult, chatbotElement);
    addValuesToSummary(chatbotSummary, chatbotHtmlResult);
    chatbotResult = chatbotHtmlResult.assertions;
  };
  return [result, chatbotResult];
}


function evaluateCUI(chatbotElement: HTMLElement|null) {
  let cuiResult, chatbotCuiResult, result, chatbotResult;
  
  // build selectors Map
  interface QWCUI_Selectors {
    [key: string]: string;
  }
  
  let QW_Selectors: QWCUI_Selectors = {
    QW_CC_WINDOW: chatbotInterface!.selectors.window[0],
    QW_CC_DIALOG: chatbotInterface!.selectors.dialog[0],
    QW_CC_MESSAGES: chatbotInterface!.messagesSelector[0],
    QW_CC_MIC: chatbotInterface!.selectors.microphone[0],
    QW_CC_INPUT: chatbotInterface!.selectors.input[0],
  };

  let sourceHtml = document.documentElement.outerHTML;
  window.cui = new CUIChecksRunner({ selectors: QW_Selectors }, { translate: locale_en, fallback: locale_en });
  window.cui.test({ sourceHtml });

  cuiResult =   window.cui.getReport();
  console.log("cuiResult", cuiResult);
  addValuesToSummary(summary, cuiResult);

  result = cuiResult.assertions;
  if (chatbotElement) {
    chatbotCuiResult = filterResults(cuiResult, chatbotElement);
    addValuesToSummary(chatbotSummary, chatbotCuiResult);
    chatbotResult = chatbotCuiResult.assertions;
    console.log("chatbotResult", chatbotResult);
  };
  return [result, chatbotResult];

}


