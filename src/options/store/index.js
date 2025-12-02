import { createStore } from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';

export const defaultState = {
  firstRun: false,
  mappedKey: '',
  options: {
    LLMService: '',
    apiKey: '',
    locale: '',
  },
};

export default new createStore({
  state: {
    firstRun: false,
    mappedKey: '',
    options: {
      LLMService: '',
      apiKey: '',
      locale: '',
    },
  },

  getters,
  mutations,
  actions,
});
