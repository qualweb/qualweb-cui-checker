import { showMessage } from '../../utils/helpers';
import { ChatBotSelectors } from '../../utils/types';
import {
  chatbotDetector,
  chatbotInterface
} from '../detection/Detection';


import { IChromeRequest } from './MapperActions';

export async function startPageChatbotProcedure(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    try {

        const selectors: ChatBotSelectors = await chatbotDetector.initDetection();
        chatbotInterface.loadInterface(selectors);
      
      resolve({ status: 'Chatbot detected', chatbot: selectors });
    } catch (error) {
      data.sendResponse({ status: 'error', message: "Failed to detect chatbot on the page", });
      reject();
 
    }
  });
}

export function actionStartVerification(data: IChromeRequest) {
  let elementName = data.request.element;
  chatbotDetector.startConfirmation(elementName);
  data.sendResponse({
    status: 'Please confirm the selection of the chatbot window',
  });
}

export function actionEndSuccessfulVerification(data: IChromeRequest) {
  try {
    chatbotDetector.endConfirmation();
    data.sendResponse({ status: 'Element selection confirmed' });
  } catch (error) {
    console.error('Error ending confirmation:', error);
    data.sendResponse({ status: 'error', message: 'Failed to confirm element selection' });
  }
  
}

export function cancelDetection(data: IChromeRequest) {
   try {
    chatbotDetector.cancelDetection();
    chatbotDetector.endConfirmation();
    chatbotDetector.reset();
    data.sendResponse({ status: 'Detection cancelled' });
  } catch (error) {
    console.error('Error cancelling detection:', error);
    data.sendResponse({ status: 'error', message: 'Failed to cancel detection' });
  }
}

export async function actionSetStoredSelectors(data: IChromeRequest) {
    try{
     chatbotInterface.loadInterface(data.request.element);
     showMessage(`Reloaded stored selectors successfully.`);
    data.sendResponse({ status: 'Stored selectors set' });
    }catch(e){
    showMessage(`One or more stored selectors could not be loaded.
                  Please make sure chatbot interface is open.`);
    data.sendResponse({ status: 'error', message: 'Failed to set stored selectors' });
    }
  
}

export async function actionCorrectElementSelection(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve) => {
    let response = chatbotDetector.requestCorrection();
    resolve(response);
  });
}

export async function resetDataContentScript() {
  chatbotDetector.reset();
  chatbotInterface.clearObject();
  return { status: 'Data reset in content script' };
}


