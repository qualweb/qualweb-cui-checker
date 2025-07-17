import * as types from "./mutation-types";

export default {
  [types.SETAPIKEY](state, apiKey) {
    state.options.apiKey = apiKey;
  },
  [types.SETLLMURL](state, llmUrl) {
    state.options.llmUrl = llmUrl;
  },
  [types.SETLLMMODEL](state, llmModel) {
    state.options.llmModel = llmModel;
  },
  [types.SETLOCALE](state, locale) {
    state.options.locale = locale;
  },
  [types.SETFIRSTRUN](state, firstRun) {
    state.firstRun = firstRun;
  },
[types.SETOPTIONS](state, options) {
  Object.assign(state, options);
},
  [types.SETLLMSERVICE](state, LLMService) {
    state.options.LLMService = LLMService;
  }
};
