import { createStore } from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';

export const defaultState = {
  selectorsDetected: false,
  tabId: null,
  sidepanelURL: '',
  storage: {
    url: '',
    selectors: {
      iframeSelector: '',
      windowsSelector: '',
      dialogSelector: '',
      inputSelector: '',
      messagesSelector: '',
      microphoneSelector: '',
    },
  },
  summary: {},
  chatbotSummary: {},
  evaluated: { act: false, cui: false, css: false, wcag: false },
  filter: {},
  act: {},
  chatbotAct: {},
  wcag: {},
  chatbotWcag: {},
  cui: {},
  chatbotCui: {},
  currentRule: {},
  chatbotInteractionInitialized: false,
  highlightActive: false,
  resultFilter: {
    passed: false,
    failed: false,
    warning: false,
    inapplicable: false,
  },
  evaluateChatbot: false,
  detectingChatbot: false,
  cuiSpeechTests: false,
};

export default new createStore({
  state: {
    selectorsDetected: false,
    tabId: null,
    sidepanelURL: '',
    storage: {
      url: '',
      selectors: {
        iframeSelector: '',
        windowsSelector: '',
        dialogSelector: '',
        inputSelector: '',
        messagesSelector: '',
        microphoneSelector: '',
      },
    },
    summary: {},
    chatbotSummary: {},
    evaluated: { act: false, cui: false, css: false, wcag: false },
    filter: {},
    act: {},
    chatbotAct: {},
    wcag: {},
    chatbotWcag: {},
    cui: {},
    chatbotCui: {},
    currentRule: {},
    chatbotInteractionInitialized: false,
    highlightActive: false,
    resultFilter: {
      passed: false,
      failed: false,
      warning: false,
      inapplicable: false,
    },
    evaluateChatbot: false,
    detectingChatbot: false,
    cuiSpeechTests: false,
  },

  getters,
  mutations,
  actions,
});
