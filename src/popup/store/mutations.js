import * as types from "./mutation-types";

export default {
  [types.SETACT](state, payload) {
    state.act = payload;
  },
  [types.SETCHATBOTACT](state, payload) {
    state.chatbotAct = payload;
  },
  [types.SETEVAL](state, payload) {
    state.evaluated[payload.module] = payload.value;
  },
  [types.SETCUI](state, payload) {
    state.cui = payload;
  },
  [types.SETCHATBOTCUI](state, payload) {
    state.chatbotCui = payload;
  },
  [types.SETHTML](state, payload) {
    state.html = payload;
  },
  [types.SETCHATBOTHTML](state, payload) {
    state.chatbotHtml = payload;
  },
  [types.SETCSS](state, payload) {
    state.css = payload;
  },
  [types.SETSUMMARY](state, payload) {
    state.summary = payload;
  },
  [types.SETCHATBOTSUMMARY](state, payload) {
    state.chatbotSummary = payload;
  },
  [types.SETALLFILTER](state, payload) {
    state.filter = payload;
  },
  [types.SETFILTER](state, payload) {
    state.filter[payload.key] = payload.value;
    let currentRule = state.currentRule;
    if (!!currentRule) {
      let currentRuleData = state[currentRule.module][currentRule.code];
      let filter = state["filter"];
      let outcome = currentRuleData["metadata"]["outcome"];
      let module = currentRule.module;
      if (!(filter[outcome] && filter[module])) {
        state.currentRule = null;
      }
    }
  },
  [types.SETALLRESULTFILTER](state, payload) {
    state.resultFilter = payload;
  },
  [types.SETRESULTFILTER](state, payload) {
    state.resultFilter[payload.key] = payload.value;
  },
  [types.SETCURRENTRULE](state, payload) {
    state.currentRule = payload;
  },
  [types.SETCURRENTRULERESULTS](state, payload) {
    state.currentRuleResults = payload;
  },
  [types.SETHIGHLIGHTACTIVE](state, payload) {
    state.highlightActive = payload;
  },
  [types.RESET](state) {
    state.evaluated = { act: false, cui: false, css: false, html: false };
    state.act = {};
    state.chatbotAct = {};
    state.cui = {};
    state.html = {};
    state.chatbotHtml = {};
    state.css = {};
    state.summary = {};
    state.chatbotSummary = {};
    state.filter = {};
    state.highlightActive = false;
    state.resultFilter = {
      passed: false,
      failed: false,
      warning: false,
      inapplicable: false,
    };
  },
  [types.SETEVALUATECHATBOT](state, payload) {
    state.evaluateChatbot = payload;
  },
  [types.SETDETECTINGCHATBOT](state, payload) {
    state.detectingChatbot = payload;
  },
};
