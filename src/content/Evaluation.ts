import { locale_en } from '../locales/en';
import { addValuesToSummary, filterResults } from '../utils/evaluationHelpers';
import { Summary } from '../utils/types';
import { chatbotInterface } from './Detection';

const urlCommonWords = chrome.runtime.getURL("dist/common-words.txt");
let summary: Summary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
let chatbotSummary: Summary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };


export function startEvaluation(sendResponse : (response: any) => void) {
  let summary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
  // only assign chatbotsummary is chatbot element is not null
  if (chatbotInterface?.windowElement) {
    chatbotSummary = { passed: 0, failed: 0, warning: 0, inapplicable: 0, title: document.title };
  }
  sendResponse([summary, chatbotSummary]);
}

export function endEvaluation(sendResponse : (response: any) => void) {
  sendResponse([summary, chatbotSummary]);
}

export function evaluateACT() {
    console.log("Evaluating ACT");
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
  
    if (chatbotInterface?.windowElement) {
      chatbotActResult = filterResults(actResult, chatbotInterface?.windowElement);
  
      addValuesToSummary(chatbotSummary, chatbotActResult);
      chatbotResult = chatbotActResult.assertions;
    };
  
    return [result, chatbotResult];
  }
  
export function evaluateWCAG() {
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
  
    if (chatbotInterface?.windowElement) {
      chatbotHtmlResult = filterResults(htmlResult, chatbotInterface?.windowElement);
      addValuesToSummary(chatbotSummary, chatbotHtmlResult);
      chatbotResult = chatbotHtmlResult.assertions;
    };
    return [result, chatbotResult];
  }
  
  
  export async function  evaluateCUI() {
    let cuiResult, chatbotCuiResult, result, chatbotResult;
    
    // build selectors Map
    interface QWCUI_Selectors {
      [key: string]: string;
    }
    
    let QW_Selectors: QWCUI_Selectors = {
      QW_CC_WINDOW: chatbotInterface!.selectors.window[0],
      QW_CC_DIALOG: chatbotInterface!.selectors.dialog[0],
      QW_CC_MESSAGES: chatbotInterface!.selectors.messages[0],
      QW_CC_MIC: chatbotInterface!.selectors.microphone[0],
      QW_CC_INPUT: chatbotInterface!.selectors.input[0],
    };
  
   // let sourceHtml = document.documentElement.outerHTML;
    window.cui = new CUIChecksRunner({ selectors: QW_Selectors }, { translate: locale_en, fallback: locale_en },urlCommonWords);
    //window.cui.test({ sourceHtml });
    await window.cui.executeTests();
    cuiResult =   window.cui.getReport();
  
    addValuesToSummary(summary, cuiResult);
  
    result = cuiResult.assertions;
    if (chatbotInterface?.windowElement) {
      chatbotCuiResult = filterResults(cuiResult, chatbotInterface?.windowElement);
      addValuesToSummary(chatbotSummary, chatbotCuiResult);
      chatbotResult = chatbotCuiResult.assertions;
  
    };
    return [result, chatbotResult];
  
  }
  