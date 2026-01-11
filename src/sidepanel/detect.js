setInterval(() => {
  chrome.runtime.sendMessage({ action: 'SIDEPANEL_ALIVE_CHECK' });
}, 10000);

async function getActiveTabId() {
  return (
    new Promise() <
    number >
    ((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }

        const activeTab = tabs[0];
        if (!activeTab || activeTab.id === undefined) {
          return reject(new Error('Nenhuma tab ativa encontrada'));
        }
        resolve(activeTab.id);
      });
    })
  );
}

function sendActionShowNotification(tabId, message) {
  chrome.runtime.sendMessage({
    action: 'SHOW_MESSAGE_NOTIFICATION',
    tabId: tabId,
    message: message,
  });
}

function sendActionHideNotification(tabId) {
  chrome.runtime.sendMessage({ action: 'HIDE_MESSAGE_NOTIFICATION', tabId: tabId });
}

async function sendActionToBackground(action, payload = {}) {
  return new Promise(async (resolve, reject) => {
    // Primeiro obtemos o tab ativo
    const resolvedTabId = payload.tabId || (await getActiveTabId());

    chrome.runtime.sendMessage({ action, tabId: resolvedTabId, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        return reject(chrome.runtime.lastError);
      }
      if (response?.status === 'error') {
        return reject(response);
      }
      resolve(response);
    });
  });
}

async function cancelDetectionRequest(tabId) {
  return sendActionToBackground('CANCEL_DETECTION', { tabId: tabId });
}

async function startPageChatbotProcedure(tabId) {
  const settings = await getQualWebSettings();
  console.log('Locale in startPageChatbotProcedure:', settings.options.locale);
  return sendActionToBackground('PAGE_CHATBOT_PROCEDURE', {
    tabId: tabId,
    locale: settings.options.locale,
  });
}

async function startCorrectionChatbot(selectors, elementName, tabId) {
  const settings = await getQualWebSettings();
  console.log('Locale in startCorrectionChatbot:', settings.options.locale);
  return sendActionToBackground('CORRECT_ELEMENT_SELECTION', {
    selectors: selectors,
    element: elementName,
    tabId: tabId,
    locale: settings.options.locale,
  });
}

async function startVerificationElement(selectors, elementName, tabId) {
  return sendActionToBackground('START_VERIFICATION', {
    selectors: selectors,
    element: elementName,
    tabId: tabId,
  });
}

async function endVerificationElement(selectors, elementName, tabId) {
  return sendActionToBackground('END_SUCCESSFUL_VERIFICATION', {
    selectors: selectors,
    element: elementName,
    tabId: tabId,
  });
}

async function loadStoredChatbotSelectors(selectors, tabId) {
  return sendActionToBackground('SET_STORED_SELECTORS', { selectors: selectors, tabId: tabId });
}

async function resetDataContentScript(tabId) {
  return sendActionToBackground('RESET_DATA', { tabId: tabId });
}

async function manualSelectMic(selectors, tabId) {
  return sendActionToBackground('MANUAL_SELECT_MIC', { selectors: selectors, tabId: tabId });
}

async function cancelManualSelectMic(selectors, tabId) {
  return sendActionToBackground('CANCEL_MANUAL_SELECT_MIC', { selectors: selectors, tabId: tabId });
}
