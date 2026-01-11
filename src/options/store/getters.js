export const getApiKey = (state) => state.options.apiKey;
export const getLocale = (state) => state.options.locale;
export const getFirstRun = (state) => state.firstRun;
export const getOptions = (state) => state.options;
export const getLLMService = (state) => state.options.LLMService;
export const getMappedApiKey = (state) => state.mappedKey;
export const isOptionsLoaded = (state) =>
  states.options &&
  state.options.apiKey !== undefined &&
  state.options.apiKey !== '' &&
  state.options.locale !== undefined &&
  state.options.locale !== '';
