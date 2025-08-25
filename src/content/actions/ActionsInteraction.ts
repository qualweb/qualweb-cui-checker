import {
  getCurrentStatusInteraction,
  handleTypeMessages,
  handleVoiceInput,
  interactWithLLM,
} from '../interaction/Interaction';
import { IChromeRequest } from './MapperActions';

export function actionStartVoiceInput(data: IChromeRequest) {
  /// start tts generation
  handleVoiceInput(data.request, null).then((chatResponses) => {
    data.sendResponse({
      status: 'Messages Audio input send and responses received',
      responses: chatResponses,
    });
  });
}

export function actionGetCurrentStateInteraction(data: IChromeRequest): Promise<object> {
  /// start tts generation
  return new Promise(async (resolve) => {
    const awaitStatus = await getCurrentStatusInteraction();
    resolve({ status: 'Status Interaction', responses: awaitStatus });
  });
}

export async function actionLLMInteraction(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve) => {
    const chatResponses = await interactWithLLM(data.request.settings);
    resolve({
      status: 'Messages typed and responses received',
      responses: chatResponses,
    });
  });
}

export async function actionTypeMessages(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve) => {
    const chatResponses = await handleTypeMessages(data.request);
    resolve({
      status: 'Messages typed and responses received',
      responses: chatResponses,
    });
  });
}
