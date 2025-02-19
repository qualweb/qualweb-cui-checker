import { actionCorrectElementSelection, actionDetectChatbot, actionEndSucessfulVerification, actionSelectMicrophone, actionStartSelection, actionStartVerification } from "./ActionsDetection";
import { actionEndEvaluation, actionEvaluateACT, actionEvaluateCUI } from "./ActionsEvaluation";
import { actionStartVoiceInput, actionTypeMessages } from "./ActionsInteraction";

export interface IChromeRequest {
    sendResponse: (response: any) => void;
    request: any;
}


const caseInteractionHandlers: Record<string, (data:IChromeRequest) => void | Promise<any>> = {
    typeMessages: actionTypeMessages,   
    startVoiceInput: actionStartVoiceInput,  
};

// handlers for the detection of chatbot actions
const caseDetectionHandlers: Record<string, (data:IChromeRequest) => void | Promise<any>> = {
    startSelection: actionStartSelection,  
    requestElementLLM: actionDetectChatbot, 
    startVerification: actionStartVerification,  
    endSucessfulVerification: actionEndSucessfulVerification , 
    correctElementSelection: actionCorrectElementSelection, 
    startMicSelection: actionSelectMicrophone,
}

// handlers for the evaluation actions
const caseEvaluationHandlers: Record<string, (data:IChromeRequest) => void | Promise<any>> = {
    startEvaluation: actionStartVerification, 
    evaluateACT: actionEvaluateACT, 
    evaluateWCAG: actionEvaluateACT, 
    evaluateCUI: actionEvaluateCUI, 
    endingEvaluation: actionEndEvaluation,
};

export const caseHandlers: Record<string,(data:IChromeRequest) => void | Promise<any>>  = {
    ...caseInteractionHandlers,
    ...caseDetectionHandlers,
    ...caseEvaluationHandlers,
};

