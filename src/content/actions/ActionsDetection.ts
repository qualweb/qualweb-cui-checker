
import { showMessage } from '../../utils/helpers';
import { ChatBotSelectors } from '../../utils/types';
import ChatbotDetector from '../detection/ChatbotDetector';
import ChatbotManualSelector from '../detection/ChatbotManualSelector';
import { IframeNotAccessibleError } from '../detection/Errors';
import InterfaceChatbot from '../detection/InterfaceChatbot';


import { IChromeRequest, sendResponse } from './MapperActions';

const languageTextMapper: Record<string, string> = {
  'en-US': APP_CONFIG.INITIAL_INTERACTION_MESSAGE_EN,
  'pt-PT': APP_CONFIG.INITIAL_INTERACTION_MESSAGE_PT,
};

export async function startPageChatbotProcedure(data: IChromeRequest): Promise<void> {
    try {
       console.log("Starting chatbot detection procedure...");
       console.log("Received locale:", data.request);
        const locale = data.request.locale || 'en-US';
        console.log("Using locale:", locale);
        const userMessage = languageTextMapper[locale] || languageTextMapper['en-US'];
        console.log("User message for detection:", userMessage);
        const selectors: ChatBotSelectors = await ChatbotDetector.getInstance().detect(userMessage);
        InterfaceChatbot.getInstance().loadInterface(selectors);
      
      sendResponse(data,{ status: "success", message: 'Chatbot detected', data: {selectors:selectors} });
    } catch (error) {
      if (error instanceof IframeNotAccessibleError) {
      showMessage("Some iframes could not be accessed due to cross-origin restrictions, which limits the chatbot detection capabilities in this version.", 2000);
        return;
      }
      sendResponse(data, { status: 'error', message: "Failed to detect chatbot on the page", });
      showMessage("Failed to detect chatbot on the page",2000);
      return;
 
    } 
}

export function actionStartVerification(data: IChromeRequest) {
  let elementName = data.request.element;
  ChatbotDetector.getInstance().startConfirmation(elementName);
  sendResponse(data,{
    status: "success",
    message: 'Please confirm the selection of the chatbot window',
  });
}

export function actionEndSuccessfulVerification(data: IChromeRequest) {
  try {
    ChatbotDetector.getInstance().endConfirmation();
    sendResponse(data, { status: 'success', message: 'Element selection confirmed' });
  } catch  {

    sendResponse(data, { status: 'error', message: 'Failed to end confirmation of elements' });
  }
  
}

export function cancelDetection(data: IChromeRequest) {
   try {
    ChatbotDetector.getInstance().cancelDetection();
    ChatbotDetector.getInstance().endConfirmation();
    ChatbotDetector.getInstance().reset();
    sendResponse(data, { status: 'success', message: 'Detection cancelled successfully' });
  } catch  {
    sendResponse(data, { status: 'error', message: 'Failed to cancel detection of elements' });
  }
}

export async function actionSetStoredSelectors(data: IChromeRequest): Promise<void> {
 
    try{
      let result = await chrome.storage.local.get('qualweb-selectors');

      if(!result){
        sendResponse(data, { status: 'error', message: 'Error retrieving selectors.' });
        return;
      }
       const selectorsForHostname =  result['qualweb-selectors']?.[data.request.url] || undefined;
       console.log("Retrieved stored selectors for hostname:", selectorsForHostname);
      if(selectorsForHostname === undefined){
        sendResponse(data, { status: 'error', message: 'No stored selectors found for this hostname.' });
        return;
      }
      
      InterfaceChatbot.getInstance().loadInterface(selectorsForHostname);
     showMessage(`Reloaded stored selectors successfully.`,2000);
    }catch{
    showMessage(`One or more stored selectors could not be loaded.
                  Please make sure chatbot interface is open.`);
    sendResponse(data, { status: 'error', message: 'Failed to set stored selectors' });
    return;
    }

    sendResponse(data, { status:"success", message: 'Stored selectors set' });
  
}

export async function actionCorrectElementSelection(data: IChromeRequest): Promise<void> {
    try{
      const locale = data.request.locale || 'en-US';
      const userMessage = languageTextMapper[locale] || languageTextMapper['en-US'];
      let response = await ChatbotDetector.getInstance().correct(data.request.element, userMessage);
      sendResponse(data, {status:"success",message:"Element selection corrected", data:  response });
    }catch{
      sendResponse(data, {status:"error", message:"Failed to correct element selection"});
      return;
    }
  
}

export  function resetDataContentScript(data: IChromeRequest) {
   ChatbotDetector.getInstance().reset();
  InterfaceChatbot.getInstance().clearObject();
  sendResponse(data, { status: "success", message: 'Data reset in content script' });
}


export async function requestManualSelectionMic(data: IChromeRequest): Promise<void>{
  try{
      
       let response = await ChatbotManualSelector.getInstance().requestSelectionMic();

        let updatedSelectors = InterfaceChatbot.getInstance().getSelectors();
        updatedSelectors.microphoneSelector = response.selector;
       
        InterfaceChatbot.getInstance().loadInterface(updatedSelectors);
    sendResponse(data, {status:"success", message:"Microphone selector updated",data:updatedSelectors});
  }catch{
    sendResponse(data, {status:"error", message:"Failed to update microphone selector"});

  }

}

export async function cancelManualDetection(data: IChromeRequest): Promise<void>{ 

  await ChatbotManualSelector.getInstance().cancelSelectionMic();

  sendResponse(data, {status:"success", message:"Canceled manual detection"});


}


