import { ACTION_HANDLERS } from '../action';
import {
  actionCorrectElementSelection,
  actionEndSuccessfulVerification,
  actionSetStoredSelectors,
  actionStartVerification,
  cancelDetection,
  cancelManualDetection,
  requestManualSelectionMic,
  resetDataContentScript,
  startPageChatbotProcedure,
} from './ActionsDetection';
import {
  actionEndEvaluation,
  actionEvaluateACT,
  actionEvaluateCUI,
  actionEvaluateWCAG,
  actionStartEvaluation,
} from './ActionsEvaluation';
import { actionLLMInteraction, actionStartVoiceInput } from './ActionsInteraction';

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

const INTERACTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.START_LLM_INTERACTION.action]: actionLLMInteraction,
  [ACTION_HANDLERS.START_LLM_SOUND_INTERACTION.action]: actionStartVoiceInput,
};

// handlers for the detection of chatbot actions
const DETECTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.PAGE_CHATBOT_PROCEDURE.action]: startPageChatbotProcedure,
  [ACTION_HANDLERS.START_VERIFICATION.action]: actionStartVerification,
  [ACTION_HANDLERS.END_SUCCESSFUL_VERIFICATION.action]: actionEndSuccessfulVerification,
  [ACTION_HANDLERS.CORRECT_ELEMENT_SELECTION.action]: actionCorrectElementSelection,
  [ACTION_HANDLERS.SET_STORED_SELECTORS.action]: actionSetStoredSelectors,
  [ACTION_HANDLERS.RESET_DATA.action]: resetDataContentScript,
  [ACTION_HANDLERS.CANCEL_DETECTION.action]: cancelDetection,
  [ACTION_HANDLERS.MANUAL_SELECT_MIC.action]: requestManualSelectionMic,
  [ACTION_HANDLERS.CANCEL_MANUAL_SELECT_MIC.action]: cancelManualDetection,
};

// handlers for the evaluation actions
const EVALUATION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.START_EVALUATION.action]: actionStartEvaluation,
  [ACTION_HANDLERS.EVALUATE_ACT.action]: actionEvaluateACT,
  [ACTION_HANDLERS.EVALUATE_WCAG.action]: actionEvaluateWCAG,
  [ACTION_HANDLERS.EVALUATE_CUI.action]: actionEvaluateCUI,
  [ACTION_HANDLERS.END_EVALUATION.action]: actionEndEvaluation,
};

export const HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  ...INTERACTION_HANDLERS,
  ...DETECTION_HANDLERS,
  ...EVALUATION_HANDLERS,
};

type STATUS = 'success' | 'error';

interface ResponseSchema {
  status: STATUS;
  message: string;
  data?: any;
}
export function sendResponse(data: IChromeRequest, response: ResponseSchema): void {
  data.sendResponse(response);
}
