import { showMessage } from "../../utils/helpers";
import { currentVerification, detectChatbotPopup, requestCorrectionElement, startConfirmElement } from "../Detection";

import { elementSelector, setGreen, unsetGreen } from "../selectChatbot";
import { microphoneSelector } from "../selectVoiceinput";
import { IChromeRequest } from "./MapperActions";



export async function actionDetectChatbot(data: IChromeRequest):Promise<object> {
return new Promise(async (resolve, reject) => {
  showMessage("Please open the chatbot");
  const response = await detectChatbotPopup();
  resolve(response);
  });


}

export function actionStartVerification(data: IChromeRequest) {
  let elementName = data.request.element;
  startConfirmElement(elementName);
  data.sendResponse({ status: 'Please confirm the selection of the chatbot window' });
}


export function actionEndSucessfulVerification(data: IChromeRequest) {
  if (currentVerification) {
    unsetGreen(currentVerification);
    data.sendResponse({ status: 'confirmed' });
  } else {
    data.sendResponse({ status: 'Nothing to confirm' });
  }
}

export async function actionCorrectElementSelection(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve) => {
  let response  = requestCorrectionElement(data.request.element);
  resolve(response);
  });
}

export function actionSelectMicrophone(data: IChromeRequest) {
  microphoneSelector.startMicrophoneSelection();
}

export function actionStartSelection(data: IChromeRequest) {
  elementSelector.startSelection();
}

