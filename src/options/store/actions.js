import * as types from './mutation-types';

function maskApiKey(apiKey, leadingChars = 10, trailingChars = 4) {
  if (!apiKey) return '';

  if (apiKey.length < leadingChars + trailingChars) {
    return apiKey.length > 6 ? apiKey.substring(0, 2) + '***' + apiKey.slice(-2) : '***';
  }

  const start = apiKey.substring(0, leadingChars);
  const end = apiKey.substring(apiKey.length - trailingChars);
  const maskLength = apiKey.length - leadingChars - trailingChars;
  const mask = '*'.repeat(maskLength);

  return start + mask + end;
}
export const loadOptions = async function ({ commit }, modules) {
  const getStorage = (key) =>
    new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result);
      });
    });

  let settings = await getStorage('qualweb_settings');

  if (
    settings.qualweb_settings &&
    settings.qualweb_settings.options &&
    settings.qualweb_settings.options.apiKey
  ) {
    let mappedKey = maskApiKey(settings.qualweb_settings.options.apiKey);
    console.log(mappedKey);

    commit(types.SETOPTIONS, settings.qualweb_settings.options);
    commit(types.SETMAPPEDAPIKEY, mappedKey);
    commit(types.SETFIRSTRUN, false);
  } else {
    commit(types.SETFIRSTRUN, true);
    commit(types.SETOPTIONS, {});
  }
};
export const saveOptions = async function ({ commit }, options) {
  await chrome.storage.local.set({ qualweb_settings: options });
  commit(types.SETOPTIONS, options);
};
