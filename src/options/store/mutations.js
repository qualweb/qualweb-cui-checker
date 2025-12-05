import * as types from './mutation-types';

export default {
  [types.SETAPIKEY](state, apiKey) {
    state.options.apiKey = apiKey;
  },
  [types.SETLOCALE](state, locale) {
    state.options.locale = locale;
  },
  [types.SETFIRSTRUN](state, firstRun) {
    state.firstRun = firstRun;
  },
  [types.SETOPTIONS](state, options) {
    state.options = options;
  },
  [types.SETLLMSERVICE](state, LLMService) {
    state.options.LLMService = LLMService;
  },
  [types.SETMAPPEDAPIKEY](state, mappedKey) {
    state.mappedKey = mappedKey;
  },
};
