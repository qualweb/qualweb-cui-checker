import {
  actionCorrectElementSelection,
  actionDetectChatbot,
  actionEndSucessfulVerification,
  actionIdentifyChatbotSelectors,
  actionSetStoredSelectors,
  actionStartVerification,
  startPageChatbotProcedure,
} from './ActionsDetection';
import { actionEndEvaluation, actionEvaluateACT, actionEvaluateCUI } from './ActionsEvaluation';
import {
  actionLLMInteraction,
  actionStartVoiceInput,
  actionTypeMessages,
} from './ActionsInteraction';

export interface IChromeRequest {
  sendResponse: (response: any) => void;
  request: any;
}

const caseInteractionHandlers: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  typeMessages: actionTypeMessages,
  startVoiceInput: actionStartVoiceInput,
  startLLMInteraction: actionLLMInteraction,
};

// handlers for the detection of chatbot actions
const caseDetectionHandlers: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  detectChatbot: actionDetectChatbot,
  pageChatbotProcedure: startPageChatbotProcedure,
  identifySelectors: actionIdentifyChatbotSelectors,
  startVerification: actionStartVerification,
  endSucessfulVerification: actionEndSucessfulVerification,
  correctElementSelection: actionCorrectElementSelection,
  setStoredSelectors: actionSetStoredSelectors,
};

// handlers for the evaluation actions
const caseEvaluationHandlers: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  startEvaluation: actionStartVerification,
  evaluateACT: actionEvaluateACT,
  evaluateWCAG: actionEvaluateACT,
  evaluateCUI: actionEvaluateCUI,
  endingEvaluation: actionEndEvaluation,
};

export const caseHandlers: Record<string, (data: IChromeRequest) => void | Promise<any>> = {
  ...caseInteractionHandlers,
  ...caseDetectionHandlers,
  ...caseEvaluationHandlers,
};
