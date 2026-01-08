import {  PORT_NAME } from '../../background/action-type';
import { interactWithLLM } from '../interaction/Interaction';
import { IChromeRequest, sendResponse } from '.';
import { InteractionWorkflowFactory } from '../factories/InteractionWorkflowFactory';
import {  SUCCESS_MESSAGES_CONTENT } from '../messages';
import * as ErrorClass from "../../errors/content/errors.class.content";
import { InvalidSelectorProvidedError } from '../../errors/content/errors.class.content';
import { ChatbotElementsFactory } from '../factories/ChatbotElementsFactory';


let currentInteractionAbortController: AbortController | null = null;

export async function actionStartVoiceInput(data: IChromeRequest): Promise<void> {
  currentInteractionAbortController = new AbortController();
  const { signal } = currentInteractionAbortController;
  /// start tts generation
  try {
  const voiceFlag = true;
  const selectors = data.request.selectors;
  if(!selectors) throw new InvalidSelectorProvidedError('No selectors provided for starting evaluation');
  if (!data.request.settings) throw new ErrorClass.SettingsNotFoundError('Settings for interaction are missing');
  if (!data.request.settings.apiKey)  throw new ErrorClass.ApiKeyNotFoundError('API key for interaction is missing');
  if (!data.request.settings.locale) throw new ErrorClass.LocaleNotFoundError('Locale for interaction is missing');

  const interfaceChatbot = ChatbotElementsFactory.init();
    
  interfaceChatbot.setSelectors(selectors);

  let port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });

  if (port === null) throw new  ErrorClass.PortConnectionError('Could not connect to background');


  await interactWithLLM(port, voiceFlag, data.request.selectors, signal);

  } catch (error) {
    currentInteractionAbortController.abort();
    currentInteractionAbortController = null;
    ChatbotElementsFactory.destroy();
    InteractionWorkflowFactory.destroy();
    throw error;
  }
  // respond to UI that interaction has started successfully
  sendResponse(data,SUCCESS_MESSAGES_CONTENT.VOICE_INTERACTION_STARTED);
}

export async function actionLLMInteraction(data: IChromeRequest): Promise<void> {
  
  currentInteractionAbortController = new AbortController();
  const { signal } = currentInteractionAbortController;
  let voiceFlag = false;
  try {
  const selectors = data.request.selectors;
  if(!selectors) throw new InvalidSelectorProvidedError('No selectors provided for starting evaluation');
  if (!data.request.settings) throw new ErrorClass.SettingsNotFoundError('Settings for interaction are missing');
  if (!data.request.settings.apiKey)  throw new ErrorClass.ApiKeyNotFoundError('API key for interaction is missing');
  if (!data.request.settings.locale) throw new ErrorClass.LocaleNotFoundError('Locale for interaction is missing');

  const interfaceChatbot = ChatbotElementsFactory.init();
    
  interfaceChatbot.setSelectors(selectors);

  const port = chrome.runtime.connect({ name: PORT_NAME.CONTENT_SCRIPT });

  if (port === null) throw new ErrorClass.PortConnectionError('Could not connect to background');

  await interactWithLLM(port, voiceFlag, data.request.selectors, signal);

  sendResponse(data,SUCCESS_MESSAGES_CONTENT.INTERACTION_STARTED);
  } catch (error) {
    ChatbotElementsFactory.destroy();
    InteractionWorkflowFactory.destroy();
    currentInteractionAbortController.abort();
    currentInteractionAbortController = null;
    throw error;
  }
  
}

export async function skipCurrentObjectiveInteraction(): Promise<void> {
  try {
    if (!currentInteractionAbortController) {
      throw new ErrorClass.NoInteractionInProgressError('No ongoing interaction to skip objective from.');
    }
    const InteractionWorkflow = InteractionWorkflowFactory.getInstance();
    await InteractionWorkflow.skipCurrentObjective(); 
  } catch (error) {
    if (currentInteractionAbortController) {
      currentInteractionAbortController.abort();
      currentInteractionAbortController = null;
    }
    throw error;
  }

}

export async function cancelInteraction(data: IChromeRequest): Promise<void>  {
  try {
    const interactionWorkflow = InteractionWorkflowFactory.getInstance();
    await interactionWorkflow.destroy();
    currentInteractionAbortController = null;
    sendResponse(data, SUCCESS_MESSAGES_CONTENT.CANCELLED_INTERACTION);
  } catch (error) {
    currentInteractionAbortController?.abort();
    currentInteractionAbortController = null;
    throw error;
  }finally {
    ChatbotElementsFactory.destroy();
    InteractionWorkflowFactory.destroy();
  }
}