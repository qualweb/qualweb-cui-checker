import { showMessage } from '../../utils/helpers';
import {
  currentVerification,
  detectPopupChatbot,
  obtainSelectorsPopupChatbot,
  detectAndGetSelectorsPageChatbot,
  requestCorrectionElement,
  startConfirmElement,
} from '../detection/Detection';
import { initiateStoredSelectors } from '../detection/StorageRetriever';

import { unsetGreen } from '../lib/visualHelpers';

import { IChromeRequest } from './MapperActions';

export async function actionDetectChatbot(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    showMessage('Please open the chatbot');
    const response = await detectPopupChatbot();
    resolve(response);
  });
}

export async function startPageChatbotProcedure(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    const response = await detectAndGetSelectorsPageChatbot();
    resolve(response);
  });
}

export async function actionIdentifyChatbotSelectors(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve, reject) => {
    const response = await obtainSelectorsPopupChatbot();
    resolve(response);
  });
}

export function actionStartVerification(data: IChromeRequest) {
  let elementName = data.request.element;
  startConfirmElement(elementName);
  data.sendResponse({
    status: 'Please confirm the selection of the chatbot window',
  });
}

export function actionEndSuccessfulVerification(data: IChromeRequest) {
  if (currentVerification) {
    unsetGreen(currentVerification);
    data.sendResponse({ status: 'confirmed' });
  } else {
    data.sendResponse({ status: 'Nothing to confirm' });
  }
}

export function cancelDetection(data: IChromeRequest) {
  if (currentVerification) {
    unsetGreen(currentVerification);
    data.sendResponse({ status: 'Detection cancelled' });
  } else {
    data.sendResponse({ status: 'Nothing to cancel' });
  }
}
export async function actionSetStoredSelectors(data: IChromeRequest) {
  console.log('actionSetStoredSelectors', data.request.element);
  initiateStoredSelectors(data.request.element);
  data.sendResponse({ status: 'Stored selectors set' });
}

export async function actionCorrectElementSelection(data: IChromeRequest): Promise<object> {
  return new Promise(async (resolve) => {
    let response = requestCorrectionElement(data.request.element);
    resolve(response);
  });
}
