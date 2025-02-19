
import { chatbotInterface } from "../Detection";
import { handleTypeMessages, handleVoiceInput } from "../Interaction";
import { IChromeRequest } from "./MapperActions";




export function actionStartVoiceInput(data:IChromeRequest) {
  /// start tts generation
  handleVoiceInput(data.request, null).then(chatResponses => {
    data.sendResponse({ status: 'Messages Audio input send and responses received', responses: chatResponses });
  });
}

export async function actionTypeMessages(data:IChromeRequest):Promise<object> {
  console.log("chegou aqui")
  return new Promise(async (resolve) => {
  const chatResponses = await handleTypeMessages(data.request, chatbotInterface);
  resolve({ status: 'Messages typed and responses received', responses: chatResponses });
  });
}