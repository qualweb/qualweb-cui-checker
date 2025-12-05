export type ActionHandler = {
  // Action Name and whether asynchronous or not
  [K in ActionType]: HandlerConfig;
};

interface HandlerConfig {
  action: ActionType;
  asynchronous: boolean;
}

export type ActionType =
  | 'START_LLM_INTERACTION'
  | 'START_LLM_SOUND_INTERACTION'
  | 'PAGE_CHATBOT_PROCEDURE'
  | 'START_VERIFICATION'
  | 'END_SUCCESSFUL_VERIFICATION'
  | 'CORRECT_ELEMENT_SELECTION'
  | 'SET_STORED_SELECTORS'
  | 'RESET_DATA'
  | 'CANCEL_DETECTION'
  | 'MANUAL_SELECT_MIC'
  | 'CANCEL_MANUAL_SELECT_MIC'
  | 'START_EVALUATION'
  | 'EVALUATE_ACT'
  | 'EVALUATE_WCAG'
  | 'EVALUATE_CUI'
  | 'END_EVALUATION'
  | 'CANCEL_EVALUATION'
  | 'SPEAK_TEXT';

export const ACTION_HANDLERS: ActionHandler = {
  // LLM Interaction Actions
  START_LLM_INTERACTION: { action: 'START_LLM_INTERACTION', asynchronous: false },
  START_LLM_SOUND_INTERACTION: { action: 'START_LLM_SOUND_INTERACTION', asynchronous: false },

  // Detection Actions
  PAGE_CHATBOT_PROCEDURE: { action: 'PAGE_CHATBOT_PROCEDURE', asynchronous: true },
  START_VERIFICATION: { action: 'START_VERIFICATION', asynchronous: false },
  END_SUCCESSFUL_VERIFICATION: { action: 'END_SUCCESSFUL_VERIFICATION', asynchronous: false },
  CORRECT_ELEMENT_SELECTION: { action: 'CORRECT_ELEMENT_SELECTION', asynchronous: true },
  SET_STORED_SELECTORS: { action: 'SET_STORED_SELECTORS', asynchronous: false },
  RESET_DATA: { action: 'RESET_DATA', asynchronous: false },
  CANCEL_DETECTION: { action: 'CANCEL_DETECTION', asynchronous: false },
  MANUAL_SELECT_MIC: { action: 'MANUAL_SELECT_MIC', asynchronous: true },
  CANCEL_MANUAL_SELECT_MIC: { action: 'CANCEL_MANUAL_SELECT_MIC', asynchronous: true },

  // Evaluation Actions
  START_EVALUATION: { action: 'START_EVALUATION', asynchronous: false },
  EVALUATE_ACT: { action: 'EVALUATE_ACT', asynchronous: false },
  EVALUATE_WCAG: { action: 'EVALUATE_WCAG', asynchronous: false },
  EVALUATE_CUI: { action: 'EVALUATE_CUI', asynchronous: true },
  END_EVALUATION: { action: 'END_EVALUATION', asynchronous: false },
  CANCEL_EVALUATION: { action: 'CANCEL_EVALUATION', asynchronous: false },
  SPEAK_TEXT: { action: 'SPEAK_TEXT', asynchronous: false },
};
