import { ACTION_HANDLERS } from '../action';
import {
  actionCorrectElementSelection,
  actionEndSuccessfulVerification,
  actionSetStoredSelectors,
  actionStartVerification,
  cancelDetection,
  resetDataContentScript,
  startPageChatbotProcedure,
} from './ActionsDetection';
import { actionEndEvaluation, actionEvaluateACT, actionEvaluateCUI, actionEvaluateWCAG, actionStartEvaluation } from './ActionsEvaluation';
import {
  actionLLMInteraction,
  actionStartVoiceInput,
} from './ActionsInteraction';

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

const INTERACTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.START_LLM_INTERACTION]: actionLLMInteraction,
  [ACTION_HANDLERS.START_LLM_SOUND_INTERACTION]: actionStartVoiceInput,
};

// handlers for the detection of chatbot actions
const DETECTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.PAGE_CHATBOT_PROCEDURE]: startPageChatbotProcedure,
  [ACTION_HANDLERS.START_VERIFICATION]: actionStartVerification,
  [ACTION_HANDLERS.END_SUCCESSFUL_VERIFICATION]: actionEndSuccessfulVerification,
  [ACTION_HANDLERS.CORRECT_ELEMENT_SELECTION]: actionCorrectElementSelection,
  [ACTION_HANDLERS.SET_STORED_SELECTORS]: actionSetStoredSelectors,
  [ACTION_HANDLERS.RESET_DATA]: resetDataContentScript,
  [ACTION_HANDLERS.CANCEL_DETECTION]: cancelDetection,
};

// handlers for the evaluation actions
const EVALUATION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [ACTION_HANDLERS.START_EVALUATION]: actionStartEvaluation,
  [ACTION_HANDLERS.EVALUATE_ACT]: actionEvaluateACT,
  [ACTION_HANDLERS.EVALUATE_WCAG]: actionEvaluateWCAG,
  [ACTION_HANDLERS.EVALUATE_CUI]: actionEvaluateCUI,
  [ACTION_HANDLERS.ENDING_EVALUATION]: actionEndEvaluation,
 // [ACTION_HANDLERS.CANCEL_EVALUATION]: null, //TODO: 
};

export const HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  ...INTERACTION_HANDLERS,
  ...DETECTION_HANDLERS,
  ...EVALUATION_HANDLERS,
};
