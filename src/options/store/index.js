import { createStore } from 'vuex';

import * as getters from "./getters";
import mutations from "./mutations";
import * as actions from "./actions";


export const defaultState = {
  firstRun: false,
  options: {
    LLMService: '',
    apiKey: '',
    llmUrl: '',
    llmModel: '',
    locale : ''
  },
};

export default new createStore({
  state: {
    firstRun: false,
  options: {
    LLMService: '',
    apiKey: '',
    llmUrl: '',
    llmModel: '',
    locale : ''
  },
  },

  getters,
  mutations,
  actions,
});
