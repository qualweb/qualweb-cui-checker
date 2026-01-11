async function startEvaluation(tabId, selectors) {
  let settingsStorage = await getQualWebSettings();
  console.log('Selectors in startEvaluation:', selectors);

  return sendActionToBackground('START_EVALUATION', {
    settings: settingsStorage.options,
    tabId: tabId,
    selectors: selectors,
  });
}

async function evaluateACT(tabId) {
  return sendActionToBackground('EVALUATE_ACT', { tabId: tabId });
}

async function evaluateWCAG(tabId) {
  return sendActionToBackground('EVALUATE_WCAG', { tabId: tabId });
}

async function evaluateCUI(tabId) {
  let settingsStorage = await getQualWebSettings();
  console.log('Settings Storage: ', settingsStorage);
  return sendActionToBackground('EVALUATE_CUI', {
    settings: settingsStorage.options,
    tabId: tabId,
  });
}

async function endEvaluation(tabId) {
  return sendActionToBackground('END_EVALUATION', { tabId: tabId });
}
async function getUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].url);
    });
  });
}

async function getQualWebSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('qualweb_settings', (result) => {
      resolve(result.qualweb_settings);
    });
  });
}
