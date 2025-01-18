import Vue from "vue";
import Vuex from "vuex";

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";

Vue.use(Vuex);

export const defaultState = {
  summary: {},
  chatbotSummary: {},
  evaluated: { act: false, cui: false, css: false, html: false },
  filter: {},
  act: {},
  chatbotAct: {},
  html: {},
  chatbotHtml: {},
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

export default new Vuex.Store({
  state: {
    summary: {},
    chatbotSummary: {},
    evaluated: { act: false, cui: false, css: false, html: false },
    filter: {},
    act: {},
    chatbotAct: {},
    html: {},
    chatbotHtml: {},
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
