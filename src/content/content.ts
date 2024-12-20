import { sendAndReceiveMessage } from './chatInteraction';
import { elementSelector, getStoredChatbotElement } from './selectChatbot';
import {detectChatbotSelection,chatbotInterface, requestElementsLLM, ChatBotInterface} from './detectChatbot';
import { ResponseStore, ChatResponse, Summary } from '../utils/types';
import { locale_en } from '../locales/en';
import { addValuesToSummary, filterResults } from '../utils/evaluationHelpers';
import { microphoneSelector, getStoredMicrophoneButton } from './selectVoiceinput';
import { showMessage } from '../utils/helpers';
import {
  CUIOptions,
  CUIChecksReport,
  CUIChecks
} from '@qualweb/cui-checks';
export let responses: ResponseStore = {};
let sentMessage: string = '';
let summary: Summary;
let chatbotSummary: Summary;

export function getSentMessage(): string {
  return sentMessage;
}

export function setSentMessage(message: string): void {
  sentMessage = message;
}

// Main message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


  const chatbotElement = getStoredChatbotElement();
  switch (request.action) {
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
      detectChatbotSelection();
      break;
    case "startMicSelection":
      microphoneSelector.startMicrophoneSelection();
      break;
    case "startEvaluation":
      summary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
      // only assign chatbotsummary is chatbot element is not null
      if (chatbotInterface?.historyElement) {
        chatbotSummary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
      }
      sendResponse([summary, chatbotSummary]);
      break;
    case "startVoiceInput":
      
      /// start tts generation
      handleVoiceInput(request, chatbotElement).then(chatResponses => {
        sendResponse({ status: 'Messages Audio input send and responses received', responses: chatResponses });
      });
      break;
    case "evaluateACT":
      const actResult = evaluateACT(chatbotInterface!.historyElement);
      sendResponse(actResult);
      break;
    case "evaluateWCAG":
      const wcagResult = evaluateWCAG(chatbotInterface!.historyElement);
      sendResponse(wcagResult);
      break;
    case "evaluateCUI":
      const cuiResult = evaluateCUI(chatbotInterface!.historyElement);
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
    
    getStoredMicrophoneButton()!.click();
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
  window.act = new ACTRules({ translate: locale_en, fallback: locale_en });
  // window.act.configure({ exclude: excludedRules })
  //window.act.validateFirstFocusableElementIsLinkToNonRepeatedContent();
  window.act.executeAtomicRules();
  window.act.executeCompositeRules();
  actResult = window.act.getReport();

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
  window.wcag = new WCAGTechniques({ translate: locale_en, fallback: locale_en });

  // window.wcag.configure({ exclude: excludedTechniques })
  htmlResult = window.wcag.execute(false);
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

  window.cui = new CUIChecks({ translate: locale_en, fallback: locale_en });



  cuiResult =   window.cui.getReport();
  addValuesToSummary(summary, cuiResult);

  result = cuiResult.assertions;
  if (chatbotElement) {
    chatbotCuiResult = filterResults(cuiResult, chatbotElement);
    addValuesToSummary(chatbotSummary, chatbotCuiResult);
    chatbotResult = chatbotCuiResult.assertions;
  };
  return [result, chatbotResult];
 
}


