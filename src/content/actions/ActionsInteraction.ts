import { handleTypeMessages, handleVoiceInput, interactWithLLM } from "../Interaction";
import { IChromeRequest } from "./MapperActions";




export function actionStartVoiceInput(data:IChromeRequest) {
  /// start tts generation
  handleVoiceInput(data.request, null).then(chatResponses => {
    data.sendResponse({ status: 'Messages Audio input send and responses received', responses: chatResponses });
  });
}

export async function actionLLMInteraction(data:IChromeRequest):Promise<object> {

  return new Promise(async (resolve) => {
  const chatResponses = await interactWithLLM();
  resolve({ status: 'Messages typed and responses received', responses: chatResponses });
  });
}

export async function actionTypeMessages(data:IChromeRequest):Promise<object> {

  return new Promise(async (resolve) => {
  const chatResponses = await handleTypeMessages(data.request);
  resolve({ status: 'Messages typed and responses received', responses: chatResponses });
  });
}