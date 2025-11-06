import { ACTION, PORT_NAME } from '../../background/action-type';
import {
  
  interactWithLLM,
} from '../interaction/Interaction';
import { IChromeRequest } from './MapperActions';

export function actionStartVoiceInput(data: IChromeRequest) {
  /// start tts generation
  return new Promise(async (resolve) => {
    let voiceFlag= true;
     let port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });
     port.postMessage({ action: ACTION.INIT_INTERACTION , settings: data.request.settings });

    const chatResponses = await interactWithLLM(port, voiceFlag);
    resolve({
      status: 'Messages typed and responses received',
      responses: chatResponses,
    });
  });
}


export function actionLLMInteraction(data: IChromeRequest) {

     let voiceFlag= false;

     let port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });
     if(port===null){
      data.sendResponse({ status: 'error', message: 'Could not connect to background' });
     }
     port.postMessage({ action: ACTION.INIT_INTERACTION , settings: data.request.settings });

    interactWithLLM(port, voiceFlag);
    data.sendResponse({ status: 'success', message: 'LLM Interaction starte' });
   ;
}


