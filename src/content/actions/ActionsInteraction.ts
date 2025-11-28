import { ACTION, PORT_NAME } from '../../background/action-type';
import {
  interactWithLLM,
} from '../interaction/Interaction';
import { IChromeRequest, sendResponse } from './MapperActions';

export async function actionStartVoiceInput(data: IChromeRequest):Promise<void> {
  /// start tts generation
    let voiceFlag= true;
    if(!data.request.settings ){
      sendResponse(data, { status: 'error', message: 'Settings for interaction are missing' });
      return;
     }else if(!data.request.settings.apiKey){
      sendResponse(data, { status: 'error', message: 'API key for interaction is missing' });
      return;
     }else if(!data.request.settings.locale){
      sendResponse(data, { status: 'error', message: 'Locale for interaction is missing' });
      return;
     }
     let port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });
      if(port===null){
      sendResponse(data, { status: 'error', message: 'Could not connect to background' });
      return;
     }
     // inform background to init interaction
     port.postMessage({ action: ACTION.INIT_INTERACTION , settings: data.request.settings });
     console.log("SETTINGS IN CONTENT SCRIPT", data.request.settings);
     // initate interaction logic in content script
    await interactWithLLM(port, voiceFlag);

    // respond to UI that interaction has started successfully
    sendResponse(data, {
      status: 'success',
      message: 'Voice interaction started Successfully',
    });
}


export  async function actionLLMInteraction(data: IChromeRequest):Promise<void> {

     let voiceFlag= false;
      // check if api key is present and locale is set
     if(!data.request.settings ){
      sendResponse(data, { status: 'error', message: 'Settings for interaction are missing' });
      return;
     }else if(!data.request.settings.apiKey){
      sendResponse(data, { status: 'error', message: 'API key for interaction is missing' });
      return;
     }else if(!data.request.settings.locale){
      sendResponse(data, { status: 'error', message: 'Locale for interaction is missing' });
      return;
     }
      let port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });
      if(port===null){
      sendResponse(data, { status: 'error', message: 'Could not connect to background' });
      return;
     }
     
     // inform background to init interaction
     port.postMessage({ action: ACTION.INIT_INTERACTION , settings: data.request.settings });
    
     // initate interaction logic in content script
    await interactWithLLM(port, voiceFlag);

    // respond to UI that interaction has started successfully
    sendResponse(data, {
      status: 'success',
      message: 'Interaction started successfully',
    });
   
}

