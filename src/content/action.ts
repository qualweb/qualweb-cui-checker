
export const ACTION_HANDLERS = {
  // LLM Interaction Actions
    START_LLM_INTERACTION: 'startLLMInteraction',
    START_LLM_SOUND_INTERACTION: 'startLLMSoundInteraction',
    
  // Detection Actions 
    PAGE_CHATBOT_PROCEDURE: 'pageChatbotProcedure',
    START_VERIFICATION: 'startVerification',
    END_SUCCESSFUL_VERIFICATION: 'endSuccessfulVerification',
    CORRECT_ELEMENT_SELECTION: 'correctElementSelection',
    SET_STORED_SELECTORS: 'setStoredSelectors',
    RESET_DATA: 'resetData',
    CANCEL_DETECTION: 'cancelDetection',

  // Evaluation Actions
    START_EVALUATION: 'startEvaluation',
    EVALUATE_ACT: 'evaluateACT',
    EVALUATE_WCAG: 'evaluateWCAG',
    EVALUATE_CUI: 'evaluateCUI',
    ENDING_EVALUATION: 'endingEvaluation',
    CANCEL_EVALUATION: 'cancelEvaluation',

};
