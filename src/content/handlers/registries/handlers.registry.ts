import * as DetectionHandler from '../detection.handler';
import * as InteractionHandler from '../interaction.handler';
import * as EvaluationHandler from '../evaluation.handler';
import { MessageResponse } from '../../../messaging/message-types';
import { HANDLER_ACTIONS } from '../../../common/handlers-actions';

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

const INTERACTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [HANDLER_ACTIONS.START_LLM_INTERACTION.name]: InteractionHandler.actionLLMInteraction,
  [HANDLER_ACTIONS.START_LLM_SOUND_INTERACTION.name]: InteractionHandler.actionStartVoiceInput,
  [HANDLER_ACTIONS.SKIP_OBJECTIVE_INTERACTION.name]:
    InteractionHandler.skipCurrentObjectiveInteraction,
  [HANDLER_ACTIONS.CANCEL_INTERACTION.name]: InteractionHandler.cancelInteraction,
};

// handlers for the detection of chatbot actions
const DETECTION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [HANDLER_ACTIONS.PAGE_CHATBOT_PROCEDURE.name]: DetectionHandler.startPageChatbotProcedure,
  [HANDLER_ACTIONS.START_VERIFICATION.name]: DetectionHandler.actionStartVerification,
  [HANDLER_ACTIONS.END_SUCCESSFUL_VERIFICATION.name]:
    DetectionHandler.actionEndSuccessfulVerification,
  [HANDLER_ACTIONS.CORRECT_ELEMENT_SELECTION.name]: DetectionHandler.actionCorrectElementSelection,
  [HANDLER_ACTIONS.RESET_DATA.name]: DetectionHandler.resetDataContentScript,
  [HANDLER_ACTIONS.CANCEL_DETECTION.name]: DetectionHandler.cancelDetection,
  [HANDLER_ACTIONS.MANUAL_SELECT_MIC.name]: DetectionHandler.requestManualSelectionMic,
  [HANDLER_ACTIONS.CANCEL_MANUAL_SELECT_MIC.name]: DetectionHandler.cancelManualDetection,
  [HANDLER_ACTIONS.SHOW_MESSAGE_NOTIFICATION.name]: DetectionHandler.showMessageContentScript,
  [HANDLER_ACTIONS.HIDE_MESSAGE_NOTIFICATION.name]: DetectionHandler.hideMessageContentScript,
};

// handlers for the evaluation actions
const EVALUATION_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  [HANDLER_ACTIONS.START_EVALUATION.name]: EvaluationHandler.actionStartEvaluation,
  [HANDLER_ACTIONS.EVALUATE_ACT.name]: EvaluationHandler.actionEvaluateACT,
  [HANDLER_ACTIONS.EVALUATE_WCAG.name]: EvaluationHandler.actionEvaluateWCAG,
  [HANDLER_ACTIONS.EVALUATE_CUI.name]: EvaluationHandler.actionEvaluateCUI,
  [HANDLER_ACTIONS.END_EVALUATION.name]: EvaluationHandler.actionEndEvaluation,
};

const OTHER_HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  // other handlers can be added here
  [HANDLER_ACTIONS.SHOW_MESSAGE_NOTIFICATION.name]: DetectionHandler.showMessageContentScript,
  [HANDLER_ACTIONS.HIDE_MESSAGE_NOTIFICATION.name]: DetectionHandler.hideMessageContentScript,
};

export const HANDLERS: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  ...INTERACTION_HANDLERS,
  ...DETECTION_HANDLERS,
  ...EVALUATION_HANDLERS,
  ...OTHER_HANDLERS,
};

export function sendResponse(data: IChromeRequest, response: MessageResponse): void {
  data.sendResponse(response);
}
