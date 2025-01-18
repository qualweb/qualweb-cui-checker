import * as types from "./mutation-types";

export const setReport = async function ({ commit }, modules) {
  let report = await evaluate(
    modules.act,
    modules.html,
    modules.css,
    modules.cui
  );

  commit(types.SETACT, report.act);
  commit(types.SETHTML, report.html);
  commit(types.SETCUI, report.cui);
  commit(types.SETCSS, report.css);
  commit(types.SETSUMMARY, report.summary);
  commit(types.SETEVAL, modules);
};

export const setCurrentRule = ({ commit }, payload) => {
  commit(types.SETCURRENTRULE, payload);
};

export const setCurrentRuleResults = ({ commit }, payload) => {
  commit(types.SETCURRENTRULE, payload);
};
export const setHighlightActive = ({ commit }, payload) => {
  commit(types.SETHIGHLIGHTACTIVE, payload);
};

export const setACT = ({ commit }, payload) => {
  commit(types.SETACT, payload);
};
export const setChatbotACT = ({ commit }, payload) => {
  commit(types.SETCHATBOTACT, payload);
};
export const setHTML = ({ commit }, payload) => {
  commit(types.SETHTML, payload);
};
export const setChatbotHTML = ({ commit }, payload) => {
  commit(types.SETCHATBOTHTML, payload);
};
export const setCUI = ({ commit }, payload) => {
  commit(types.SETCUI, payload);
};
export const setChatbotCUI = ({ commit }, payload) => {
  commit(types.SETCHATBOTCUI, payload);
};
export const setCSS = ({ commit }, payload) => {
  commit(types.SETCSS, payload);
};
export const setSummary = ({ commit }, payload) => {
  commit(types.SETSUMMARY, payload);
};
export const setChatbotSummary = ({ commit }, payload) => {
  commit(types.SETCHATBOTSUMMARY, payload);
};
export const setEvaluated = ({ commit }, payload) => {
  commit(types.SETEVAL, payload);
};
export const setFilter = ({ commit }, payload) => {
  commit(types.SETFILTER, payload);
};
export const setStartingFilter = ({ commit }, modules) => {
  commit(types.SETALLFILTER, {
    passed: true,
    failed: true,
    warning: true,
    inapplicable: false,
    act: modules.act,
    html: modules.html,
    cui: modules.cui,
  });
};

export const setResultFilter = ({ commit }, payload) => {
  commit(types.SETRESULTFILTER, payload);
};
export const setStartingResultFilter = ({ commit }, payload) => {
  commit(types.SETALLRESULTFILTER, payload);
};

export const setEvaluateChatbot = ({ commit }, payload) => {
  commit(types.SETEVALUATECHATBOT, payload);
};

export const setDetectingChatbot = ({ commit }, payload) => {
  commit(types.SETDETECTINGCHATBOT, payload);
};

export const reset = ({ commit }) => {
  commit(types.RESET);
};
