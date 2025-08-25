import * as types from './mutation-types';

export const loadOptions = async function ({ commit }, modules) {
  let settings = await chrome.storage.local.get('qualweb_settings');
  console.log('Settings loaded from storage:', settings.qualweb_settings);
  if (settings.qualweb_settings) {
    commit(types.SETOPTIONS, settings.qualweb_settings);
  } else {
    commit(types.SETFIRSTRUN, true);
    commit(types.SETOPTIONS, {});
  }
};

export const saveOptions = async function ({ commit }, options) {
  await chrome.storage.local.set({ qualweb_settings: options });
  commit(types.SETOPTIONS, options);
};
