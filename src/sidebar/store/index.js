import { createStore } from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';

export const defaultState = {
  storage: {
    url: '',
    selectors: {
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
  highlightActive: false,
  resultFilter: {
    passed: false,
    failed: false,
    warning: false,
    inapplicable: false,
  },
  evaluateChatbot: false,
  detectingChatbot: false,
};

export default new createStore({
  state: {
    storage: {
      url: '',
      selectors: {
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
    highlightActive: false,
    resultFilter: {
      passed: false,
      failed: false,
      warning: false,
      inapplicable: false,
    },
    evaluateChatbot: false,
    detectingChatbot: false,
  },

  getters,
  mutations,
  actions,
});
